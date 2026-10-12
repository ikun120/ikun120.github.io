/**
 * KasRT - Dues Feature Logic (Idempotent Bill Generation & Payment Verification)
 * Pembuatan tagihan massal, pencatatan pembayaran multi-mode, verifikasi instan, dan penolakan
 */
(function() {
  'use strict';
  if (window.KasRT_Features_Dues_Loaded) return;

  const Utils = window.KasRT.Utils;

  const DuesFeature = {
    async generateBills(bulan, tahun, duesTypeId = 'DT-001') {
      const db = window.KasRT.DB;
      const residents = db.list('residents').filter(r => r.status === 'Aktif');
      const duesType = db.get('duesTypes', duesTypeId) || { nominal: 50000 };
      const settings = db.get('settings', 'global') || {};
      const dueDay = settings.jatuhTempoHari || 10;
      const paddedMonth = String(bulan).padStart(2, '0');
      const jatuhTempo = `${tahun}-${paddedMonth}-${String(dueDay).padStart(2, '0')}`;

      let generatedCount = 0;
      let skippedCount = 0;

      for (const resident of residents) {
        const billId = `BILL-${tahun}${paddedMonth}-${resident.id}`;
        const existing = db.get('duesBills', billId);
        if (existing) {
          skippedCount++;
          continue;
        }

        const newBill = {
          id: billId,
          residentId: resident.id,
          duesTypeId,
          periodeBulan: Number(bulan),
          periodeTahun: Number(tahun),
          nominal: duesType.nominal || 50000,
          status: 'Belum',
          jumlahDibayar: 0,
          jatuhTempo,
          createdAt: Utils.nowISO(),
          updatedAt: Utils.nowISO()
        };
        await db.set('duesBills', newBill);
        generatedCount++;
      }

      if (window.KasRT && window.KasRT.DBMonitor) {
        window.KasRT.DBMonitor.logActivity('INFO', 'DUES_GENERATED', `Diterbitkan ${generatedCount} tagihan iuran baru untuk periode ${bulan}/${tahun}`);
      }

      return { generatedCount, skippedCount, totalResidents: residents.length };
    },

    async recordPayment(paymentData) {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      const idemKey = paymentData.idempotencyKey || window.KasRT.Idem.gen('PAY');
      const existing = window.KasRT.Idem.check(idemKey, 'duesPayments');
      if (existing) return existing;

      const bill = db.get('duesBills', paymentData.billId);
      if (!bill) throw new Error('Data tagihan tidak ditemukan.');
      const resident = db.get('residents', paymentData.residentId || bill.residentId);

      const jumlah = Utils.parseNumber(paymentData.jumlah);
      if (jumlah <= 0) throw new Error('Nominal pembayaran harus lebih besar dari Rp 0.');

      const paymentId = db.nextId('PAY', 'duesPayments');
      const isPrivileged = auth && (auth.Permissions.isAdmin() || auth.Permissions.isBendahara() || auth.Permissions.has('verify_dues'));
      const status = isPrivileged ? 'Terverifikasi' : 'Menunggu Verifikasi';

      let linkedTrxId = null;
      if (status === 'Terverifikasi') {
        const cashAccountId = paymentData.cashAccountId || 'ACC-001';
        const categoryId = 'CAT-IN-001';

        const trx = await window.KasRT.Features.Transactions.addTransaction({
          tanggal: paymentData.tanggalBayar || Utils.today(),
          tipe: 'Pemasukan',
          cashAccountId,
          categoryId,
          subKategori: 'Iuran Wajib Bulanan',
          jumlah,
          keterangan: `Pembayaran iuran ${bill.periodeBulan}/${bill.periodeTahun} - ${resident ? resident.nama : 'Warga'}`,
          metode: paymentData.metode || 'Tunai',
          buktiUrl: paymentData.buktiUrl || '',
          source: 'DuesPayment',
          residentId: bill.residentId,
          sumberDana: {
            tipe: 'warga',
            label: 'Warga Pembayar',
            nama: resident ? resident.nama : 'Warga',
            residentId: bill.residentId
          }
        });
        linkedTrxId = trx.id;

        const totalPaid = (bill.jumlahDibayar || 0) + jumlah;
        let billStatus = 'Sebagian';
        if (totalPaid >= bill.nominal) {
          billStatus = 'Lunas';
        }

        await db.update('duesBills', bill.id, {
          jumlahDibayar: totalPaid,
          status: billStatus
        });
      }

      const paymentDoc = {
        id: paymentId,
        billId: bill.id,
        residentId: bill.residentId,
        tanggalBayar: paymentData.tanggalBayar || Utils.today(),
        jumlah,
        metode: paymentData.metode || 'Tunai',
        buktiUrl: paymentData.buktiUrl || '',
        status,
        verifiedBy: isPrivileged ? (currentUser ? currentUser.nama : 'Bendahara') : null,
        verifiedAt: isPrivileged ? Utils.nowISO() : null,
        transactionId: linkedTrxId,
        mode: paymentData.mode || 'Penuh',
        idempotencyKey: idemKey,
        createdBy: currentUser ? currentUser.nama : 'Sistem',
        createdAt: Utils.nowISO()
      };

      await db.set('duesPayments', paymentDoc);
      return paymentDoc;
    },

    async verifyPayment(paymentId) {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      const payment = db.get('duesPayments', paymentId);
      if (!payment) throw new Error('Data pembayaran tidak ditemukan.');
      if (payment.status === 'Terverifikasi') throw new Error('Pembayaran sudah terverifikasi sebelumnya.');

      const bill = db.get('duesBills', payment.billId);
      const resident = db.get('residents', payment.residentId);

      const trx = await window.KasRT.Features.Transactions.addTransaction({
        tanggal: payment.tanggalBayar,
        tipe: 'Pemasukan',
        cashAccountId: 'ACC-001',
        categoryId: 'CAT-IN-001',
        subKategori: 'Iuran Wajib Bulanan',
        jumlah: payment.jumlah,
        keterangan: `Iuran Terverifikasi: ${resident ? resident.nama : 'Warga'} (${bill ? `${bill.periodeBulan}/${bill.periodeTahun}` : ''})`,
        metode: payment.metode,
        buktiUrl: payment.buktiUrl,
        source: 'DuesPayment',
        residentId: payment.residentId,
        sumberDana: {
          tipe: 'warga',
          label: 'Warga Pembayar',
          nama: resident ? resident.nama : 'Warga',
          residentId: payment.residentId
        }
      });

      if (bill) {
        const totalPaid = (bill.jumlahDibayar || 0) + payment.jumlah;
        const billStatus = totalPaid >= bill.nominal ? 'Lunas' : 'Sebagian';
        await db.update('duesBills', bill.id, {
          jumlahDibayar: totalPaid,
          status: billStatus
        });
      }

      const updatedPayment = await db.update('duesPayments', payment.id, {
        status: 'Terverifikasi',
        verifiedBy: currentUser ? currentUser.nama : 'Bendahara',
        verifiedAt: Utils.nowISO(),
        transactionId: trx.id
      });

      return updatedPayment;
    },

    async rejectPayment(paymentId, reason) {
      if (!reason || !reason.trim()) throw new Error('Alasan penolakan pembayaran wajib disertakan.');
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      const payment = db.get('duesPayments', paymentId);
      if (!payment) throw new Error('Data pembayaran tidak ditemukan.');

      if (payment.transactionId) {
        await window.KasRT.Features.Transactions.voidTransaction(payment.transactionId, `Penolakan pembayaran iuran: ${reason}`);
      }

      const bill = db.get('duesBills', payment.billId);
      if (bill && payment.status === 'Terverifikasi') {
        const remainingPaid = Math.max(0, (bill.jumlahDibayar || 0) - payment.jumlah);
        await db.update('duesBills', bill.id, {
          jumlahDibayar: remainingPaid,
          status: remainingPaid === 0 ? 'Belum' : 'Sebagian'
        });
      }

      const updated = await db.update('duesPayments', payment.id, {
        status: 'Ditolak',
        rejectReason: reason.trim(),
        rejectedBy: currentUser ? currentUser.nama : 'Bendahara',
        rejectedAt: Utils.nowISO()
      });

      return updated;
    },

    getWaReminderUrl(bill) {
      const db = window.KasRT.DB;
      const resident = db.get('residents', bill.residentId);
      if (!resident || !resident.noHp) return '';
      const settings = db.get('settings', 'global') || {};
      const cleanPhone = resident.noHp.replace(/\D/g, '').replace(/^0/, '62');
      const text = encodeURIComponent(
        `Halo Bapak/Ibu ${resident.nama},\n\n` +
        `Kami dari pengurus ${settings.namaOrganisasi || 'RT 01'} menginformasikan kewajiban iuran untuk periode *${bill.periodeBulan}/${bill.periodeTahun}* sebesar *${Utils.formatRp(bill.nominal)}*.\n` +
        `Status saat ini: *${bill.status}* (Jatuh tempo: ${Utils.formatDate(bill.jatuhTempo)}).\n\n` +
        `Pembayaran dapat ditransfer ke ${settings.namaKop || 'Kas RT'} atau diserahkan langsung ke bendahara (${settings.namaBendahara || 'Bendahara'}).\n` +
        `Terima kasih atas partisipasi dan kebersamaannya.`
      );
      return `https://wa.me/${cleanPhone}?text=${text}`;
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Features = window.KasRT.Features || {};
  window.KasRT.Features.Dues = DuesFeature;
  window.KasRT_Features_Dues_Loaded = true;
})();
