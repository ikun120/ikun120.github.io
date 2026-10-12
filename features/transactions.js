/**
 * KasRT - Transactions Feature Logic (Atomic & Idempotent)
 * Penambahan transaksi kas, pengubahan, void (pembatalan), dan sinkronisasi saldo akun
 */
(function() {
  'use strict';
  if (window.KasRT_Features_Transactions_Loaded) return;

  const Utils = window.KasRT.Utils;

  const TransactionsFeature = {
    async addTransaction(data) {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      if (!data.cashAccountId) throw new Error('Akun kas harus dipilih.');
      if (!data.categoryId) throw new Error('Kategori kas harus dipilih.');

      const jumlah = Utils.parseNumber(data.jumlah);
      if (jumlah <= 0) throw new Error('Nominal transaksi harus lebih besar dari 0.');

      const account = db.get('cashAccounts', data.cashAccountId);
      if (!account) throw new Error('Akun kas tidak ditemukan.');

      const category = db.get('categories', data.categoryId);
      const categoryName = category ? category.nama : (data.categoryNameSnapshot || 'Umum');

      if (data.tipe === 'Pengeluaran' && (account.saldoSaatIni || 0) < jumlah) {
        throw new Error(`Saldo akun "${account.nama}" tidak mencukupi (Tersedia: ${Utils.formatRp(account.saldoSaatIni || 0)}).`);
      }

      const id = db.nextId('TRX', 'transactions');
      const now = Utils.nowISO();

      const trxRecord = {
        id,
        tanggal: data.tanggal || Utils.today(),
        tipe: data.tipe || 'Pemasukan',
        cashAccountId: data.cashAccountId,
        categoryId: data.categoryId,
        categoryNameSnapshot: categoryName,
        subKategori: data.subKategori || '',
        jumlah,
        keterangan: data.keterangan || '',
        metode: data.metode || 'Tunai',
        buktiUrl: data.buktiUrl || '',
        status: 'Final',
        source: data.source || 'Manual',
        residentId: data.residentId || null,
        sumberDana: data.sumberDana || null,
        createdBy: currentUser ? currentUser.nama : 'Petugas',
        createdAt: now,
        updatedAt: now
      };

      const delta = data.tipe === 'Pemasukan' ? jumlah : -jumlah;
      const newBalance = (account.saldoSaatIni || 0) + delta;
      await db.update('cashAccounts', account.id, { saldoSaatIni: newBalance });
      await db.set('transactions', trxRecord);

      if (category) {
        await db.update('categories', category.id, {
          usageCount: (category.usageCount || 0) + 1
        });
      }

      await db.log(currentUser?.id || 'sys', 'CREATE_TRANSACTION', 'transactions', id, null, trxRecord);

      if (window.KasRT && window.KasRT.DBMonitor) {
        window.KasRT.DBMonitor.logActivity(
          'INFO',
          'TRANSACTION_CREATED',
          `Transaksi ${trxRecord.tipe} dicatat: ${Utils.formatRp(jumlah)} (${categoryName}) oleh ${currentUser?.nama || 'Petugas'}`
        );
      }

      return trxRecord;
    },

    async editTransaction(id, patch) {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      const oldTrx = db.get('transactions', id);
      if (!oldTrx) throw new Error('Transaksi tidak ditemukan.');
      if (oldTrx.status === 'Void') throw new Error('Transaksi yang sudah dibatalkan (Void) tidak dapat diubah.');

      const oldAccount = db.get('cashAccounts', oldTrx.cashAccountId);
      const newAccountId = patch.cashAccountId || oldTrx.cashAccountId;
      const newAccount = db.get('cashAccounts', newAccountId);

      const oldJumlah = oldTrx.jumlah;
      const newJumlah = patch.jumlah !== undefined ? Utils.parseNumber(patch.jumlah) : oldJumlah;
      const newTipe = patch.tipe || oldTrx.tipe;

      const oldDelta = oldTrx.tipe === 'Pemasukan' ? oldJumlah : -oldJumlah;
      let rolledBalance = (oldAccount.saldoSaatIni || 0) - oldDelta;

      if (oldAccount.id === newAccount.id) {
        const newDelta = newTipe === 'Pemasukan' ? newJumlah : -newJumlah;
        const finalBalance = rolledBalance + newDelta;
        if (newTipe === 'Pengeluaran' && finalBalance < 0) {
          throw new Error(`Perubahan nominal menyebabkan saldo ${newAccount.nama} negatif.`);
        }
        await db.update('cashAccounts', oldAccount.id, { saldoSaatIni: finalBalance });
      } else {
        await db.update('cashAccounts', oldAccount.id, { saldoSaatIni: rolledBalance });
        const newDelta = newTipe === 'Pemasukan' ? newJumlah : -newJumlah;
        const newAccBalance = (newAccount.saldoSaatIni || 0) + newDelta;
        if (newTipe === 'Pengeluaran' && newAccBalance < 0) {
          throw new Error(`Saldo akun tujuan "${newAccount.nama}" tidak mencukupi.`);
        }
        await db.update('cashAccounts', newAccount.id, { saldoSaatIni: newAccBalance });
      }

      let categorySnapshot = oldTrx.categoryNameSnapshot;
      if (patch.categoryId && patch.categoryId !== oldTrx.categoryId) {
        const cat = db.get('categories', patch.categoryId);
        if (cat) categorySnapshot = cat.nama;
      }

      const updatedTrx = {
        ...oldTrx,
        ...patch,
        jumlah: newJumlah,
        categoryNameSnapshot: categorySnapshot,
        editedAt: Utils.nowISO(),
        editedBy: currentUser ? currentUser.nama : 'Pengurus'
      };

      await db.set('transactions', updatedTrx);
      await db.log(currentUser?.id || 'sys', 'EDIT_TRANSACTION', 'transactions', id, oldTrx, updatedTrx);
      return updatedTrx;
    },

    async voidTransaction(id, reason) {
      if (!reason || !reason.trim()) throw new Error('Alasan pembatalan (Void) wajib diisi.');
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      const trx = db.get('transactions', id);
      if (!trx) throw new Error('Transaksi tidak ditemukan.');
      if (trx.status === 'Void') throw new Error('Transaksi ini sudah berstatus Void.');

      const account = db.get('cashAccounts', trx.cashAccountId);
      if (account) {
        const delta = trx.tipe === 'Pemasukan' ? -trx.jumlah : trx.jumlah;
        const newBalance = (account.saldoSaatIni || 0) + delta;
        await db.update('cashAccounts', account.id, { saldoSaatIni: newBalance });
      }

      const voided = {
        ...trx,
        status: 'Void',
        voidReason: reason.trim(),
        voidedAt: Utils.nowISO(),
        voidedBy: currentUser ? currentUser.nama : 'Pengurus'
      };

      await db.set('transactions', voided);
      await db.log(currentUser?.id || 'sys', 'VOID_TRANSACTION', 'transactions', id, trx, voided);

      if (window.KasRT && window.KasRT.DBMonitor) {
        window.KasRT.DBMonitor.logActivity('WARNING', 'TRANSACTION_VOID', `Transaksi ${trx.id} dibatalkan (Void): "${reason.trim()}"`);
      }

      return voided;
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Features = window.KasRT.Features || {};
  window.KasRT.Features.Transactions = TransactionsFeature;
  window.KasRT_Features_Transactions_Loaded = true;
})();
