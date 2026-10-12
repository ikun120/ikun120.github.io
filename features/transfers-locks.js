/**
 * KasRT - Transfers & Period Locks Feature
 * Transfer saldo antar akun kas RT dan proteksi periode tutup buku (period locks)
 */
(function() {
  'use strict';
  if (window.KasRT_Features_TransfersLocks_Loaded) return;

  const Utils = window.KasRT.Utils;

  const TransfersLocksFeature = {
    async transfer(fromAccountId, toAccountId, nominal, catatan = '', tanggal = null) {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      if (fromAccountId === toAccountId) {
        throw new Error('Akun asal dan akun tujuan tidak boleh sama.');
      }

      const jumlah = Utils.parseNumber(nominal);
      if (jumlah <= 0) {
        throw new Error('Nominal transfer harus lebih besar dari Rp 0.');
      }

      const fromAcc = db.get('cashAccounts', fromAccountId);
      const toAcc = db.get('cashAccounts', toAccountId);
      if (!fromAcc || !toAcc) {
        throw new Error('Akun kas asal atau tujuan tidak ditemukan.');
      }

      if ((fromAcc.saldoSaatIni || 0) < jumlah) {
        throw new Error(`Saldo "${fromAcc.nama}" tidak mencukupi untuk transfer (Tersedia: ${Utils.formatRp(fromAcc.saldoSaatIni || 0)}).`);
      }

      const transferDate = tanggal || Utils.today();
      const transferId = db.nextId('TRF', 'accountTransfers');

      await db.update('cashAccounts', fromAcc.id, {
        saldoSaatIni: (fromAcc.saldoSaatIni || 0) - jumlah
      });
      await db.update('cashAccounts', toAcc.id, {
        saldoSaatIni: (toAcc.saldoSaatIni || 0) + jumlah
      });

      const transferRecord = {
        id: transferId,
        fromAccountId,
        toAccountId,
        fromAccountNama: fromAcc.nama,
        toAccountNama: toAcc.nama,
        nominal: jumlah,
        catatan: catatan || `Transfer dari ${fromAcc.nama} ke ${toAcc.nama}`,
        tanggal: transferDate,
        createdBy: currentUser ? currentUser.nama : 'Bendahara',
        createdAt: Utils.nowISO()
      };

      await db.set('accountTransfers', transferRecord);
      await db.log(currentUser?.id || 'sys', 'ACCOUNT_TRANSFER', 'accountTransfers', transferId, null, transferRecord);

      if (window.KasRT && window.KasRT.DBMonitor) {
        window.KasRT.DBMonitor.logActivity('INFO', 'CASH_TRANSFER', `Transfer kas ${Utils.formatRp(jumlah)} dari ${fromAcc.nama} ke ${toAcc.nama}`);
      }

      return transferRecord;
    },

    async lockPeriod(bulan, tahun, catatan = '') {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      const paddedM = String(bulan).padStart(2, '0');
      const lockId = `LOCK-${tahun}${paddedM}`;
      const lockRecord = {
        id: lockId,
        periodeBulan: Number(bulan),
        periodeTahun: Number(tahun),
        lockedAt: Utils.nowISO(),
        lockedBy: currentUser ? currentUser.nama : 'Pengurus',
        catatan: catatan || `Tutup buku periode ${bulan}/${tahun}`,
        status: 'Locked'
      };

      await db.set('periodLocks', lockRecord);
      await db.log(currentUser?.id || 'sys', 'PERIOD_LOCK', 'periodLocks', lockId, null, lockRecord);

      if (window.KasRT && window.KasRT.DBMonitor) {
        window.KasRT.DBMonitor.logActivity('WARNING', 'PERIOD_LOCKED', `Tutup buku disahkan untuk periode ${bulan}/${tahun}`);
      }

      return lockRecord;
    },

    async unlockPeriod(lockId, alasan = '') {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      const existing = db.get('periodLocks', lockId);
      if (!existing) throw new Error('Data kunci periode tidak ditemukan.');

      await db.remove('periodLocks', lockId);
      await db.log(currentUser?.id || 'sys', 'PERIOD_UNLOCK', 'periodLocks', lockId, existing, { alasan });
      return true;
    },

    isLocked(dateIso) {
      if (!dateIso) return false;
      const db = window.KasRT.DB;
      const locks = db.list('periodLocks') || [];
      const d = new Date(dateIso);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      return locks.some(l => l.status === 'Locked' && l.periodeBulan === m && l.periodeTahun === y);
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Features = window.KasRT.Features || {};
  window.KasRT.Features.TransfersLocks = TransfersLocksFeature;
  window.KasRT_Features_TransfersLocks_Loaded = true;
})();
