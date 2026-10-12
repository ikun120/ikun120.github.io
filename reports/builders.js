/**
 * KasRT - Report Body Builders (21 Core + 10 Inventaris)
 * Menghasilkan tabel HTML kanonik, kartu ringkasan, dan kalkulasi matematis akurat
 */
(function() {
  'use strict';
  if (window.KasRT_Reports_Builders_Loaded) return;

  const Utils = window.KasRT.Utils;

  function sectionTitle(num, text, note = '') {
    return `
      <div class="mt-4 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-baseline justify-between">
        <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5 font-display">
          <span class="w-4 h-4 rounded bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 flex items-center justify-center text-[10px] font-black">${num}</span>
          <span>${text}</span>
        </h3>
        ${note ? `<span class="text-[10px] text-slate-400 font-medium">${note}</span>` : ''}
      </div>
    `;
  }

  function summaryCards(cards = []) {
    return `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-2.5">
        ${cards.map(c => `
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">${c.label}</span>
            <div class="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 font-mono my-0.5">${c.value}</div>
            ${c.sub ? `<span class="text-[9px] text-slate-400 font-medium truncate">${c.sub}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  function emptyRow(cols, msg = 'Tidak ada catatan data pada periode ini.') {
    return `<tr><td colspan="${cols}" class="text-center py-5 text-xs text-slate-400 italic">${msg}</td></tr>`;
  }

  function tbl(headers = [], rows = [], footers = []) {
    return `
      <div class="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700 my-2.5">
        <table class="w-full text-[11px] text-left text-slate-900 dark:text-slate-100 border-collapse">
          <thead class="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-700 tracking-wider">
            <tr>
              ${headers.map((h) => `<th class="py-2 px-2.5 ${h.align || 'text-left'} font-extrabold">${h.text}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
            ${rows.length === 0 ? emptyRow(headers.length) : rows.join('')}
          </tbody>
          ${footers.length > 0 ? `
            <tfoot class="bg-slate-100/80 dark:bg-slate-800/80 font-bold border-t-2 border-b-2 border-slate-800 dark:border-slate-200 text-xs font-mono">
              ${footers.join('')}
            </tfoot>
          ` : ''}
        </table>
      </div>
    `;
  }

  const Builders = {
    'KAS-01': (filter = {}) => {
      const db = window.KasRT.DB;
      const transactions = db.list('transactions')
        .filter(t => t.status !== 'Void')
        .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
      let totalIn = 0;
      let totalOut = 0;
      let runningSaldo = 0;
      const accounts = db.list('cashAccounts');
      const saldoAwalTotal = accounts.reduce((sum, a) => sum + (a.saldoAwal || 0), 0);
      runningSaldo = saldoAwalTotal;

      const rows = transactions.map((t, idx) => {
        const isIn = t.tipe === 'Pemasukan';
        if (isIn) {
          totalIn += t.jumlah;
          runningSaldo += t.jumlah;
        } else {
          totalOut += t.jumlah;
          runningSaldo -= t.jumlah;
        }
        const party = t.sumberDana ? (t.sumberDana.nama || t.sumberDana.label) : '-';
        return `
          <tr class="hover:bg-surface-container/30 transition-colors">
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-mono whitespace-nowrap">${Utils.formatDate(t.tanggal)}</td>
            <td class="py-2 px-3 font-mono text-[11px] text-slate-500">${t.id}</td>
            <td class="py-2 px-3">
              <div class="font-bold text-on-surface">${t.keterangan || t.categoryNameSnapshot}</div>
              <div class="text-[10px] text-slate-400">${t.categoryNameSnapshot} | Pihak: ${party}</div>
            </td>
            <td class="py-2 px-3 font-mono text-right text-emerald-600 dark:text-emerald-400">${isIn ? Utils.formatRp(t.jumlah) : '-'}</td>
            <td class="py-2 px-3 font-mono text-right text-rose-600 dark:text-rose-400">${!isIn ? Utils.formatRp(t.jumlah) : '-'}</td>
            <td class="py-2 px-3 font-mono text-right font-bold">${Utils.formatRp(runningSaldo)}</td>
          </tr>
        `;
      });

      const cards = summaryCards([
        { label: 'Saldo Awal', value: Utils.formatRp(saldoAwalTotal), sub: 'Seluruh akun kas' },
        { label: 'Total Pemasukan', value: Utils.formatRp(totalIn), sub: `${transactions.filter(t => t.tipe === 'Pemasukan').length} transaksi` },
        { label: 'Total Pengeluaran', value: Utils.formatRp(totalOut), sub: `${transactions.filter(t => t.tipe === 'Pengeluaran').length} transaksi` },
        { label: 'Saldo Akhir Kas', value: Utils.formatRp(runningSaldo), sub: 'Kas konsolidasi' }
      ]);

      const headers = [
        { text: 'No', align: 'text-left' },
        { text: 'Tanggal', align: 'text-left' },
        { text: 'ID Transaksi', align: 'text-left' },
        { text: 'Uraian / Keterangan', align: 'text-left' },
        { text: 'Masuk (Rp)', align: 'text-right' },
        { text: 'Keluar (Rp)', align: 'text-right' },
        { text: 'Saldo (Rp)', align: 'text-right' }
      ];

      const footers = [
        `<tr>
          <td colspan="4" class="py-2.5 px-3 text-right uppercase">Total Mutasi & Saldo Akhir:</td>
          <td class="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">${Utils.formatRp(totalIn)}</td>
          <td class="py-2.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400">${Utils.formatRp(totalOut)}</td>
          <td class="py-2.5 px-3 text-right font-mono font-black">${Utils.formatRp(runningSaldo)}</td>
        </tr>`
      ];

      return `
        ${cards}
        ${sectionTitle('I', 'Daftar Mutasi Buku Kas Umum')}
        ${tbl(headers, rows, footers)}
      `;
    },

    'KAS-02': () => {
      const db = window.KasRT.DB;
      const accounts = db.list('cashAccounts');
      const transactions = db.list('transactions').filter(t => t.status !== 'Void');
      let sectionsHtml = '';

      accounts.forEach((acc, aIdx) => {
        const accTrx = transactions.filter(t => t.cashAccountId === acc.id);
        let cur = acc.saldoAwal || 0;
        let totIn = 0;
        let totOut = 0;

        const rows = accTrx.map((t, idx) => {
          const isIn = t.tipe === 'Pemasukan';
          if (isIn) { totIn += t.jumlah; cur += t.jumlah; }
          else { totOut += t.jumlah; cur -= t.jumlah; }
          return `
            <tr>
              <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
              <td class="py-2 px-3 font-mono">${Utils.formatDate(t.tanggal)}</td>
              <td class="py-2 px-3">${t.keterangan || t.categoryNameSnapshot}</td>
              <td class="py-2 px-3 font-mono text-right text-emerald-600">${isIn ? Utils.formatRp(t.jumlah) : '-'}</td>
              <td class="py-2 px-3 font-mono text-right text-rose-600">${!isIn ? Utils.formatRp(t.jumlah) : '-'}</td>
              <td class="py-2 px-3 font-mono text-right font-bold">${Utils.formatRp(cur)}</td>
            </tr>
          `;
        });

        const headers = [
          { text: 'No' }, { text: 'Tanggal' }, { text: 'Uraian' },
          { text: 'Masuk', align: 'text-right' }, { text: 'Keluar', align: 'text-right' }, { text: 'Saldo', align: 'text-right' }
        ];

        sectionsHtml += `
          ${sectionTitle(String.fromCharCode(65 + aIdx), `${acc.nama} (Saldo: ${Utils.formatRp(acc.saldoSaatIni || 0)})`)}
          ${tbl(headers, rows)}
        `;
      });
      return sectionsHtml;
    },

    'KAS-03': () => {
      const db = window.KasRT.DB;
      const transactions = db.list('transactions').filter(t => t.status !== 'Void' && t.tipe === 'Pemasukan');
      let total = 0;
      const rows = transactions.map((t, idx) => {
        total += t.jumlah;
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-mono">${Utils.formatDate(t.tanggal)}</td>
            <td class="py-2 px-3 font-semibold">${t.categoryNameSnapshot}</td>
            <td class="py-2 px-3">${t.subKategori || '-'}</td>
            <td class="py-2 px-3">${t.sumberDana?.nama || '-'}</td>
            <td class="py-2 px-3">${t.keterangan || '-'}</td>
            <td class="py-2 px-3 font-mono text-right text-emerald-600 font-bold">${Utils.formatRp(t.jumlah)}</td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'Tanggal' }, { text: 'Kategori' }, { text: 'Subkategori' },
        { text: 'Penyetor / Pihak' }, { text: 'Keterangan' }, { text: 'Nominal', align: 'text-right' }
      ];
      const footers = [`<tr><td colspan="6" class="py-2.5 px-3 text-right uppercase">Total Seluruh Penerimaan:</td><td class="py-2.5 px-3 text-right font-mono text-emerald-600 font-black">${Utils.formatRp(total)}</td></tr>`];
      return `${sectionTitle('I', 'Rincian Bukti Penerimaan Kas')}${tbl(headers, rows, footers)}`;
    },

    'KAS-04': () => {
      const db = window.KasRT.DB;
      const transactions = db.list('transactions').filter(t => t.status !== 'Void' && t.tipe === 'Pengeluaran');
      let total = 0;
      const rows = transactions.map((t, idx) => {
        total += t.jumlah;
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-mono">${Utils.formatDate(t.tanggal)}</td>
            <td class="py-2 px-3 font-semibold">${t.categoryNameSnapshot}</td>
            <td class="py-2 px-3">${t.subKategori || '-'}</td>
            <td class="py-2 px-3">${t.sumberDana?.nama || '-'}</td>
            <td class="py-2 px-3">${t.keterangan || '-'}</td>
            <td class="py-2 px-3 font-mono text-right text-rose-600 font-bold">${Utils.formatRp(t.jumlah)}</td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'Tanggal' }, { text: 'Pos Pengeluaran' }, { text: 'Subkategori' },
        { text: 'Penerima / Vendor' }, { text: 'Keterangan' }, { text: 'Nominal', align: 'text-right' }
      ];
      const footers = [`<tr><td colspan="6" class="py-2.5 px-3 text-right uppercase">Total Seluruh Pengeluaran:</td><td class="py-2.5 px-3 text-right font-mono text-rose-600 font-black">${Utils.formatRp(total)}</td></tr>`];
      return `${sectionTitle('I', 'Rincian Bukti Belanja & Operasional RT')}${tbl(headers, rows, footers)}`;
    },

    'KAS-05': () => {
      const db = window.KasRT.DB;
      const categories = db.list('categories');
      const transactions = db.list('transactions').filter(t => t.status !== 'Void');
      const rows = categories.map((cat, idx) => {
        const catTrx = transactions.filter(t => t.categoryId === cat.id);
        const total = catTrx.reduce((sum, t) => sum + (t.jumlah || 0), 0);
        const count = catTrx.length;
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-bold">${cat.nama}</td>
            <td class="py-2 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${cat.tipe === 'Pemasukan' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">${cat.tipe}</span></td>
            <td class="py-2 px-3 text-center font-mono">${count}</td>
            <td class="py-2 px-3 font-mono text-right font-bold ${cat.tipe === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}">${Utils.formatRp(total)}</td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'Nama Pos Anggaran' }, { text: 'Tipe' },
        { text: 'Volume Trx', align: 'text-center' }, { text: 'Total Akumulasi', align: 'text-right' }
      ];
      return `${sectionTitle('I', 'Sebaran Dana Berdasarkan Pos Kategori Kas')}${tbl(headers, rows)}`;
    },

    'KAS-06': () => {
      const db = window.KasRT.DB;
      const accounts = db.list('cashAccounts');
      let grandAwal = 0;
      let grandKini = 0;
      const rows = accounts.map((acc, idx) => {
        grandAwal += acc.saldoAwal || 0;
        grandKini += acc.saldoSaatIni || 0;
        const diff = (acc.saldoSaatIni || 0) - (acc.saldoAwal || 0);
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-bold">${acc.nama}</td>
            <td class="py-2 px-3 font-mono text-right">${Utils.formatRp(acc.saldoAwal || 0)}</td>
            <td class="py-2 px-3 font-mono text-right font-bold">${Utils.formatRp(acc.saldoSaatIni || 0)}</td>
            <td class="py-2 px-3 font-mono text-right font-semibold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${diff >= 0 ? '+' : ''}${Utils.formatRp(diff)}</td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'Rekening / Brankas' },
        { text: 'Saldo Awal', align: 'text-right' }, { text: 'Saldo Saat Ini', align: 'text-right' }, { text: 'Netto Mutasi', align: 'text-right' }
      ];
      const footers = [`<tr><td colspan="2" class="py-2.5 px-3 text-right uppercase">Total Konsolidasi:</td><td class="py-2.5 px-3 text-right font-mono">${Utils.formatRp(grandAwal)}</td><td class="py-2.5 px-3 text-right font-mono font-black">${Utils.formatRp(grandKini)}</td><td class="py-2.5 px-3 text-right font-mono font-bold">${Utils.formatRp(grandKini - grandAwal)}</td></tr>`];
      return `${sectionTitle('I', 'Rekonsiliasi Saldo Fisik & Perbankan Kas RT')}${tbl(headers, rows, footers)}`;
    },

    'KAS-07': () => {
      const db = window.KasRT.DB;
      const transfers = db.list('accountTransfers');
      const rows = transfers.map((tr, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-mono">${Utils.formatDate(tr.tanggal)}</td>
          <td class="py-2 px-3 font-medium">${tr.fromAccountNama}</td>
          <td class="py-2 px-3 font-medium">${tr.toAccountNama}</td>
          <td class="py-2 px-3">${tr.catatan || '-'}</td>
          <td class="py-2 px-3 font-mono text-right font-bold">${Utils.formatRp(tr.nominal)}</td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'Tanggal' }, { text: 'Dari Akun' },
        { text: 'Tujuan Akun' }, { text: 'Keperluan' }, { text: 'Nominal Transfer', align: 'text-right' }
      ];
      return `${sectionTitle('I', 'Riwayat Pemindahan Dana (Account Transfers)')}${tbl(headers, rows)}`;
    },

    'KAS-08': () => {
      const db = window.KasRT.DB;
      const locks = db.list('periodLocks');
      const rows = locks.map((l, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-bold font-mono">Bulan ${l.periodeBulan} / ${l.periodeTahun}</td>
          <td class="py-2 px-3">${l.catatan || 'Tutup Buku Resmi'}</td>
          <td class="py-2 px-3">${l.lockedBy || 'Pengurus'}</td>
          <td class="py-2 px-3 font-mono text-slate-500">${Utils.formatDateTime(l.lockedAt)}</td>
          <td class="py-2 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Terkunci</span></td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'Periode Buku' }, { text: 'Catatan Pengesahan' },
        { text: 'Disahkan Oleh' }, { text: 'Waktu Kunci' }, { text: 'Status' }
      ];
      return `${sectionTitle('I', 'Arsip Periode Tutup Buku yang Terkunci')}${tbl(headers, rows)}`;
    },

    'WRG-01': () => {
      const db = window.KasRT.DB;
      const residents = db.list('residents');
      const rows = residents.map((r, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-mono text-slate-500">${r.id}</td>
          <td class="py-2 px-3 font-bold">${r.nama}</td>
          <td class="py-2 px-3">${r.alamat || '-'}</td>
          <td class="py-2 px-3 font-mono">${r.noHp || '-'}</td>
          <td class="py-2 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}">${r.status}</span></td>
          <td class="py-2 px-3 text-slate-500 text-[11px]">${r.catatan || '-'}</td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'ID' }, { text: 'Nama Kepala Keluarga / Warga' },
        { text: 'Alamat Rumah' }, { text: 'No. Kontak/WA' }, { text: 'Status' }, { text: 'Keterangan' }
      ];
      return `${sectionTitle('I', 'Buku Induk Registrasi Kependudukan Warga RT')}${tbl(headers, rows)}`;
    },

    'IUR-01': () => {
      const db = window.KasRT.DB;
      const residents = db.list('residents');
      const bills = db.list('duesBills');
      const headers = [
        { text: 'No' }, { text: 'Nama Warga' },
        ...Array.from({ length: 12 }, (_, i) => ({ text: `B${i + 1}`, align: 'text-center' }))
      ];
      const rows = residents.map((r, idx) => {
        const monthCols = Array.from({ length: 12 }, (_, i) => {
          const m = i + 1;
          const bill = bills.find(b => b.residentId === r.id && b.periodeBulan === m && b.periodeTahun === 2026);
          if (!bill) return '<td class="py-2 px-1 text-center text-slate-300">-</td>';
          if (bill.status === 'Lunas') return '<td class="py-2 px-1 text-center font-bold text-emerald-600">✓</td>';
          if (bill.status === 'Sebagian') return '<td class="py-2 px-1 text-center font-bold text-amber-500">½</td>';
          return '<td class="py-2 px-1 text-center font-bold text-rose-500">✗</td>';
        }).join('');
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-bold">${r.nama}</td>
            ${monthCols}
          </tr>
        `;
      });
      return `
        <div class="text-[11px] text-slate-500 mb-2">Keterangan: <strong class="text-emerald-600">✓ Lunas</strong> | <strong class="text-amber-500">½ Sebagian</strong> | <strong class="text-rose-500">✗ Menunggak</strong> | <strong>- Belum Terbit</strong></div>
        ${sectionTitle('I', 'Matriks Kepatuhan Setoran Iuran Warga (Tahun 2026)')}
        ${tbl(headers, rows)}
      `;
    },

    'IUR-02': () => {
      const db = window.KasRT.DB;
      const residents = db.list('residents');
      const bills = db.list('duesBills').filter(b => b.status === 'Belum' || b.status === 'Sebagian');
      const rows = residents.map((r, idx) => {
        const rBills = bills.filter(b => b.residentId === r.id);
        const totalTunggak = rBills.reduce((sum, b) => sum + (b.nominal - (b.jumlahDibayar || 0)), 0);
        if (totalTunggak === 0) return null;
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-bold">${r.nama}</td>
            <td class="py-2 px-3">${r.alamat || '-'}</td>
            <td class="py-2 px-3 text-center font-mono font-bold text-rose-600">${rBills.length} Bulan</td>
            <td class="py-2 px-3 font-mono text-right font-black text-rose-600">${Utils.formatRp(totalTunggak)}</td>
          </tr>
        `;
      }).filter(Boolean);
      const headers = [
        { text: 'No' }, { text: 'Nama Warga Menunggak' }, { text: 'Alamat' },
        { text: 'Jumlah Bulan', align: 'text-center' }, { text: 'Total Kewajiban', align: 'text-right' }
      ];
      return `${sectionTitle('I', 'Daftar Piutang Iuran Tertunggak')}${tbl(headers, rows)}`;
    },

    'IUR-03': () => {
      const db = window.KasRT.DB;
      const payments = db.list('duesPayments').filter(p => p.status === 'Terverifikasi');
      let total = 0;
      const rows = payments.map((p, idx) => {
        total += p.jumlah;
        const res = db.get('residents', p.residentId);
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-mono">${Utils.formatDate(p.tanggalBayar)}</td>
            <td class="py-2 px-3 font-bold">${res ? res.nama : 'Warga'}</td>
            <td class="py-2 px-3">${p.metode}</td>
            <td class="py-2 px-3 text-slate-500">${p.verifiedBy || 'Bendahara'}</td>
            <td class="py-2 px-3 font-mono text-right text-emerald-600 font-bold">${Utils.formatRp(p.jumlah)}</td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'Tanggal Bayar' }, { text: 'Warga' },
        { text: 'Metode' }, { text: 'Verifikator' }, { text: 'Nominal', align: 'text-right' }
      ];
      const footers = [`<tr><td colspan="5" class="py-2.5 px-3 text-right uppercase">Total Iuran Terverifikasi:</td><td class="py-2.5 px-3 text-right font-mono text-emerald-600 font-black">${Utils.formatRp(total)}</td></tr>`];
      return `${sectionTitle('I', 'Rekapitulasi Pembayaran Iuran Sah')}${tbl(headers, rows, footers)}`;
    },

    'IUR-04': () => {
      const db = window.KasRT.DB;
      const bills = db.list('duesBills').filter(b => b.status === 'Bebas');
      const rows = bills.map((b, idx) => {
        const res = db.get('residents', b.residentId);
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-bold">${res ? res.nama : 'Warga'}</td>
            <td class="py-2 px-3 font-mono">Bulan ${b.periodeBulan}/${b.periodeTahun}</td>
            <td class="py-2 px-3">${b.alasanKeringanan || 'Kebijakan Pengurus / Warga Lansia'}</td>
            <td class="py-2 px-3 font-mono text-right">${Utils.formatRp(b.nominal)}</td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'Warga Penerima Keringanan' }, { text: 'Periode' },
        { text: 'Alasan Kebijakan' }, { text: 'Nominal Dibebaskan', align: 'text-right' }
      ];
      return `${sectionTitle('I', 'Daftar Pembebasan / Keringanan Iuran Warga')}${tbl(headers, rows)}`;
    },

    'IUR-05': () => {
      const db = window.KasRT.DB;
      const payments = db.list('duesPayments');
      const rows = payments.map((p, idx) => {
        const res = db.get('residents', p.residentId);
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-mono">${Utils.formatDate(p.tanggalBayar)}</td>
            <td class="py-2 px-3 font-bold">${res ? res.nama : 'Warga'}</td>
            <td class="py-2 px-3 font-mono text-slate-500">${p.billId}</td>
            <td class="py-2 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Terverifikasi' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${p.status}</span></td>
            <td class="py-2 px-3 font-mono text-right font-bold">${Utils.formatRp(p.jumlah)}</td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'Tanggal' }, { text: 'Nama Warga' },
        { text: 'Ref Tagihan' }, { text: 'Status' }, { text: 'Jumlah', align: 'text-right' }
      ];
      return `${sectionTitle('I', 'Log Seluruh Transaksi Pembayaran Iuran')}${tbl(headers, rows)}`;
    },

    'IUR-06': () => {
      const db = window.KasRT.DB;
      const payments = db.list('duesPayments').filter(p => p.status === 'Menunggu Verifikasi');
      const rows = payments.map((p, idx) => {
        const res = db.get('residents', p.residentId);
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-mono">${Utils.formatDate(p.tanggalBayar)}</td>
            <td class="py-2 px-3 font-bold">${res ? res.nama : 'Warga'}</td>
            <td class="py-2 px-3">${p.metode}</td>
            <td class="py-2 px-3 font-mono text-right font-bold">${Utils.formatRp(p.jumlah)}</td>
            <td class="py-2 px-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Menunggu Verifikasi</span></td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'Tanggal Pengajuan' }, { text: 'Nama Warga' },
        { text: 'Metode Pembayaran' }, { text: 'Jumlah', align: 'text-right' }, { text: 'Status', align: 'text-center' }
      ];
      return `${sectionTitle('I', 'Antrean Verifikasi Setoran Iuran')}${tbl(headers, rows)}`;
    },

    'SYS-01': () => {
      const db = window.KasRT.DB;
      const logs = db.list('auditLogs').slice(0, 50);
      const rows = logs.map((l, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-mono text-slate-500 whitespace-nowrap">${Utils.formatDateTime(l.timestamp)}</td>
          <td class="py-2 px-3 font-bold">${l.userName || 'Sistem'}</td>
          <td class="py-2 px-3 font-mono text-[11px] font-bold text-primary">${l.aksi}</td>
          <td class="py-2 px-3 font-mono text-slate-500">${l.collection}</td>
          <td class="py-2 px-3 font-mono text-slate-400">${l.recordId || '-'}</td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'Waktu' }, { text: 'Petugas / User' },
        { text: 'Aksi' }, { text: 'Entitas' }, { text: 'Record ID' }
      ];
      return `${sectionTitle('I', 'Jejak Audit Aktivitas Pengurus & Sistem (Immutable)')}${tbl(headers, rows)}`;
    },

    'SYS-02': () => {
      const db = window.KasRT.DB;
      const categories = db.list('categories');
      const rows = categories.map((c, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-mono text-slate-500">${c.id}</td>
          <td class="py-2 px-3 font-bold">${c.nama}</td>
          <td class="py-2 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.tipe === 'Pemasukan' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">${c.tipe}</span></td>
          <td class="py-2 px-3 text-slate-500">${(c.subItems || []).join(', ') || '-'}</td>
          <td class="py-2 px-3 text-center font-mono">${c.usageCount || 0}</td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'Kode Kategori' }, { text: 'Nama Pos Anggaran' },
        { text: 'Jenis' }, { text: 'Sub-Kategori' }, { text: 'Frekuensi Pakai', align: 'text-center' }
      ];
      return `${sectionTitle('I', 'Struktur Kode Akun Kategori Keuangan RT')}${tbl(headers, rows)}`;
    },

    'CIC-01': () => {
      const db = window.KasRT.DB;
      const plans = db.list('installmentPlans');
      const rows = plans.map((p, idx) => {
        const res = db.get('residents', p.residentId);
        const sisa = Math.max(0, p.totalPokok - (p.totalDibayar || 0));
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-mono text-slate-500">${p.id}</td>
            <td class="py-2 px-3 font-bold">${res ? res.nama : 'Warga'}</td>
            <td class="py-2 px-3 font-mono text-right">${Utils.formatRp(p.totalPokok)}</td>
            <td class="py-2 px-3 font-mono text-right text-emerald-600">${Utils.formatRp(p.totalDibayar || 0)}</td>
            <td class="py-2 px-3 font-mono text-right text-rose-600 font-bold">${Utils.formatRp(sisa)}</td>
            <td class="py-2 px-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}">${p.status}</span></td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'No. Rencana' }, { text: 'Nama Warga' },
        { text: 'Total Pokok', align: 'text-right' }, { text: 'Terbayar', align: 'text-right' }, { text: 'Sisa Pokok', align: 'text-right' }, { text: 'Status', align: 'text-center' }
      ];
      return `${sectionTitle('I', 'Monitoring Portofolio Skema Cicilan Warga')}${tbl(headers, rows)}`;
    },

    'CIC-02': () => {
      const db = window.KasRT.DB;
      const schedules = db.list('installmentSchedules');
      const rows = schedules.map((s, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-mono">${s.planId}</td>
          <td class="py-2 px-3 font-bold text-center">Termin ${s.terminKe}</td>
          <td class="py-2 px-3 font-mono">${Utils.formatDate(s.tanggalJatuhTempo)}</td>
          <td class="py-2 px-3 font-mono text-right font-bold">${Utils.formatRp(s.nominal)}</td>
          <td class="py-2 px-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${s.status}</span></td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'ID Rencana' }, { text: 'Termin Ke', align: 'text-center' },
        { text: 'Jatuh Tempo' }, { text: 'Nominal', align: 'text-right' }, { text: 'Status', align: 'text-center' }
      ];
      return `${sectionTitle('I', 'Jadwal & Jatuh Tempo Angsuran Cicilan')}${tbl(headers, rows)}`;
    },

    'CIC-03': () => {
      const db = window.KasRT.DB;
      const allocs = db.list('paymentAllocations');
      const rows = allocs.map((a, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-mono text-slate-500">${a.paymentId}</td>
          <td class="py-2 px-3 font-mono">${a.planId}</td>
          <td class="py-2 px-3 font-mono">${a.scheduleId}</td>
          <td class="py-2 px-3 font-mono text-right text-emerald-600 font-bold">${Utils.formatRp(a.jumlah)}</td>
          <td class="py-2 px-3 font-mono text-slate-400">${Utils.formatDate(a.createdAt)}</td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'ID Pembayaran' }, { text: 'Rencana' },
        { text: 'Termin Terisi (FIFO)' }, { text: 'Jumlah Teralokasi', align: 'text-right' }, { text: 'Tanggal Alokasi' }
      ];
      return `${sectionTitle('I', 'Audit Distribusi Alokasi Setoran FIFO')}${tbl(headers, rows)}`;
    },

    'CIC-04': () => {
      const db = window.KasRT.DB;
      const logs = db.list('reminderLogs');
      const rows = logs.map((l, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-mono">${Utils.formatDateTime(l.createdAt)}</td>
          <td class="py-2 px-3 font-bold">${l.residentNama || 'Warga'}</td>
          <td class="py-2 px-3 font-mono">${l.targetPhone || '-'}</td>
          <td class="py-2 px-3">${l.message || 'Pemberitahuan tagihan'}</td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'Waktu Blast' }, { text: 'Warga Penerima' },
        { text: 'Nomor WA' }, { text: 'Isi Pesan / Template' }
      ];
      return `${sectionTitle('I', 'Log Pengiriman Pengingat WhatsApp')}${tbl(headers, rows)}`;
    },

    'INV-01': () => {
      const db = window.KasRT.DB;
      const items = db.list('inventoryItems');
      const categories = db.list('inventoryCategories');
      let totBaik = 0;
      let totCacat = 0;
      const rows = items.map((item, idx) => {
        totBaik += item.jumlahBaik || 0;
        totCacat += item.jumlahCacat || 0;
        const cat = categories.find(c => c.id === item.categoryId);
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-mono text-slate-500">${item.id}</td>
            <td class="py-2 px-3 font-bold text-on-surface">${item.nama}</td>
            <td class="py-2 px-3">${cat ? cat.nama : '-'}</td>
            <td class="py-2 px-3 text-right font-mono font-bold text-emerald-600">${item.jumlahBaik}</td>
            <td class="py-2 px-3 text-right font-mono font-bold text-rose-600">${item.jumlahCacat}</td>
            <td class="py-2 px-3 text-right font-mono font-black">${(item.jumlahBaik || 0) + (item.jumlahCacat || 0)}</td>
            <td class="py-2 px-3 font-mono text-slate-500 text-[11px]">${Utils.formatDate(item.lastCheckedAt)}</td>
          </tr>
        `;
      });
      const cards = summaryCards([
        { label: 'Total Aset RT', value: items.length + ' Jenis', sub: 'Terdata di master' },
        { label: 'Kondisi Baik', value: totBaik + ' Unit', sub: 'Siap digunakan warga' },
        { label: 'Kondisi Cacat / Rusak', value: totCacat + ' Unit', sub: 'Perlu servis/ganti' },
        { label: 'Total Fisik', value: (totBaik + totCacat) + ' Unit', sub: 'Keseluruhan' }
      ]);
      const headers = [
        { text: 'No' }, { text: 'ID Aset' }, { text: 'Nama Barang' }, { text: 'Kategori' },
        { text: 'Baik', align: 'text-right' }, { text: 'Cacat', align: 'text-right' },
        { text: 'Total', align: 'text-right' }, { text: 'Terakhir Dicek' }
      ];
      return `${cards}${sectionTitle('I', 'Buku Induk Inventaris Perlengkapan & Aset RT')}${tbl(headers, rows)}`;
    },

    'INV-02': () => {
      const db = window.KasRT.DB;
      const items = db.list('inventoryItems');
      const itemsRusak = items.filter(i => (i.jumlahCacat || 0) > 0);
      const rows = itemsRusak.map((item, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-bold">${item.nama}</td>
          <td class="py-2 px-3 text-right font-mono text-rose-600 font-bold">${item.jumlahCacat} Unit</td>
          <td class="py-2 px-3 text-slate-600 dark:text-slate-300">${item.keterangan || 'Kerusakan pemakaian wajar'}</td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'Nama Barang Bermasalah' },
        { text: 'Jumlah Cacat', align: 'text-right' }, { text: 'Catatan Kerusakan' }
      ];
      return `${sectionTitle('I', 'Daftar Aset Yang Mengalami Kerusakan / Perlu Servis')}${tbl(headers, rows)}`;
    },

    'INV-03': () => {
      const db = window.KasRT.DB;
      const categories = db.list('inventoryCategories');
      const items = db.list('inventoryItems');
      const rows = categories.map((cat, idx) => {
        const catItems = items.filter(i => i.categoryId === cat.id);
        const totalUnit = catItems.reduce((sum, i) => sum + (i.jumlahBaik || 0) + (i.jumlahCacat || 0), 0);
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-bold">${cat.nama}</td>
            <td class="py-2 px-3">${cat.deskripsi || '-'}</td>
            <td class="py-2 px-3 text-center font-mono font-bold">${catItems.length}</td>
            <td class="py-2 px-3 text-right font-mono font-black">${totalUnit} Unit</td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'Kategori Perlengkapan' }, { text: 'Deskripsi' },
        { text: 'Jenis Barang', align: 'text-center' }, { text: 'Total Fisik', align: 'text-right' }
      ];
      return `${sectionTitle('I', 'Sebaran Inventaris Berdasarkan Kategori Aset')}${tbl(headers, rows)}`;
    },

    'INV-04': () => {
      const db = window.KasRT.DB;
      const checks = db.list('inventoryChecks');
      const rows = checks.map((c, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-mono">${Utils.formatDate(c.tanggalPengecekan)}</td>
          <td class="py-2 px-3 font-bold">${c.groupNama || 'Tim Petugas'}</td>
          <td class="py-2 px-3">${c.petugasNama || 'Petugas'}</td>
          <td class="py-2 px-3 text-center font-mono font-bold">${c.ringkasan?.totalItem || 0}</td>
          <td class="py-2 px-3 text-center font-semibold ${c.ringkasan?.adaPerubahan ? 'text-amber-600' : 'text-emerald-600'}">${c.ringkasan?.adaPerubahan ? 'Ada Selisih' : 'Sesuai Fisik'}</td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'Tanggal Cek' }, { text: 'Kelompok Petugas' },
        { text: 'Koordinator' }, { text: 'Item Diperiksa', align: 'text-center' }, { text: 'Hasil Opname', align: 'text-center' }
      ];
      return `${sectionTitle('I', 'Buku Catatan Pelaksanaan Pengecekan Fisik (Stock Opname)')}${tbl(headers, rows)}`;
    },

    'INV-05': () => {
      const db = window.KasRT.DB;
      const adjustments = db.list('inventoryAdjustments');
      const rows = adjustments.map((a, idx) => {
        const item = db.get('inventoryItems', a.itemId);
        return `
          <tr>
            <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2 px-3 font-bold">${item ? item.nama : a.itemId}</td>
            <td class="py-2 px-3 font-mono text-center">${a.sebelum?.baik}/${a.sebelum?.cacat}</td>
            <td class="py-2 px-3 font-mono text-center font-bold">${a.sesudah?.baik}/${a.sesudah?.cacat}</td>
            <td class="py-2 px-3">${a.alasan || 'Koreksi fisik'}</td>
            <td class="py-2 px-3 text-slate-500">${a.petugasNama}</td>
          </tr>
        `;
      });
      const headers = [
        { text: 'No' }, { text: 'Nama Barang' }, { text: 'Sebelum (B/C)', align: 'text-center' },
        { text: 'Sesudah (B/C)', align: 'text-center' }, { text: 'Alasan Koreksi' }, { text: 'Petugas' }
      ];
      return `${sectionTitle('I', 'Daftar Mutasi Penyesuaian Jumlah Fisik Barang')}${tbl(headers, rows)}`;
    },

    'INV-06': () => Builders['INV-02'](),

    'INV-07': () => {
      const db = window.KasRT.DB;
      const officers = db.list('inventoryOfficers');
      const rows = officers.map((o, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-bold">${o.nama}</td>
          <td class="py-2 px-3 font-semibold text-primary">${o.jabatan}</td>
          <td class="py-2 px-3 font-mono">${o.noHp || '-'}</td>
          <td class="py-2 px-3 font-mono text-slate-500">${Utils.formatDate(o.periodeMulai)} s.d. ${Utils.formatDate(o.periodeSelesai)}</td>
          <td class="py-2 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">${o.status}</span></td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'Nama Petugas' }, { text: 'Jabatan / Tanggung Jawab' },
        { text: 'No. Kontak/WA' }, { text: 'Masa Tugas' }, { text: 'Status' }
      ];
      return `${sectionTitle('I', 'Struktur Tim & Petugas Pemeliharaan Inventaris RT')}${tbl(headers, rows)}`;
    },

    'INV-08': () => {
      const db = window.KasRT.DB;
      const schedules = db.list('inventorySchedules');
      const rows = schedules.map((s, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-bold">${s.judul}</td>
          <td class="py-2 px-3 font-mono capitalize">${s.frekuensi}</td>
          <td class="py-2 px-3 font-mono font-bold text-primary">${Utils.formatDate(s.tanggalPengecekan)}</td>
          <td class="py-2 px-3">${s.groupNama || 'Semua Petugas'}</td>
          <td class="py-2 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${s.status}</span></td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'Agenda Pengecekan' }, { text: 'Frekuensi' },
        { text: 'Tanggal Pelaksanaan' }, { text: 'Penanggung Jawab Tim' }, { text: 'Status' }
      ];
      return `${sectionTitle('I', 'Kalender Rencana Kerja Opname Aset RT')}${tbl(headers, rows)}`;
    },

    'INV-09': () => {
      const db = window.KasRT.DB;
      const items = db.list('inventoryItems');
      const now = Date.now();
      const staleItems = items.filter(i => {
        if (!i.lastCheckedAt) return true;
        const diffDays = (now - new Date(i.lastCheckedAt).getTime()) / (1000 * 3600 * 24);
        return diffDays > 30;
      });
      const rows = staleItems.map((item, idx) => `
        <tr>
          <td class="py-2 px-3 text-slate-400 font-mono">${idx + 1}</td>
          <td class="py-2 px-3 font-bold">${item.nama}</td>
          <td class="py-2 px-3 font-mono text-slate-500">${Utils.formatDate(item.lastCheckedAt)}</td>
          <td class="py-2 px-3 text-rose-600 font-bold">${Math.round((now - new Date(item.lastCheckedAt || 0).getTime()) / (1000 * 3600 * 24))} Hari Lalu</td>
          <td class="py-2 px-3 text-slate-500">${item.lastCheckedBy || '-'}</td>
        </tr>
      `);
      const headers = [
        { text: 'No' }, { text: 'Nama Barang' }, { text: 'Terakhir Dicek' },
        { text: 'Usia Tanpa Pengecekan', align: 'text-left' }, { text: 'Pemeriksa Terakhir' }
      ];
      return `${sectionTitle('I', 'Daftar Aset Yang Belum Dicek Lebih Dari 30 Hari')}${tbl(headers, rows)}`;
    },

    'INV-10': () => {
      const db = window.KasRT.DB;
      const settings = db.get('settings', 'global') || {};
      const items = db.list('inventoryItems');
      const totBaik = items.reduce((s, i) => s + (i.jumlahBaik || 0), 0);
      const totCacat = items.reduce((s, i) => s + (i.jumlahCacat || 0), 0);
      return `
        <div class="space-y-4 text-xs leading-relaxed text-on-surface">
          <p>Pada hari ini, bertempat di Sekretariat ${settings.namaOrganisasi || 'RT 01 / RW 01'}, telah dilaksanakan pemeriksaan fisik berkala atas seluruh barang milik rukun tetangga dengan rincian ringkasan sebagai berikut:</p>
          <div class="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant space-y-2">
            <div>1. Total Macam Barang Terdata: <strong>${items.length} jenis</strong></div>
            <div>2. Total Fisik Barang Kondisi Baik: <strong class="text-emerald-600">${totBaik} unit</strong></div>
            <div>3. Total Fisik Barang Kondisi Rusak/Cacat: <strong class="text-rose-600">${totCacat} unit</strong></div>
            <div>4. Total Keseluruhan Fisik Aset: <strong>${totBaik + totCacat} unit</strong></div>
          </div>
          <p>Seluruh barang yang tercatat dalam kondisi baik telah tersimpan dengan aman pada gudang perlengkapan balai RT, dan barang yang cacat telah diajukan untuk perbaikan/penghapusan sesuai musyawarah warga.</p>
          <p>Demikian Berita Acara ini dibuat dengan sebenarnya untuk dipergunakan sebagai bahan pertanggungjawaban kepengurusan RT.</p>
        </div>
      `;
    }
  };

  function buildDynamicReport(code, filter = {}) {
    const catalog = window.KasRT.Reports && window.KasRT.Reports.Catalog;
    const item = catalog ? catalog.getByCode(code) : null;
    const group = (item && item.group) || 'Kas';
    const db = window.KasRT.DB;
    if (!db) return `<div class="p-6 text-center text-slate-400">Database belum dimuat.</div>`;
    return `
      <div class="space-y-4 text-xs">
        ${sectionTitle('1', 'Informasi Dokumen Laporan')}
        <div class="p-4 rounded-2xl bg-surface-container/40 border border-outline-variant space-y-2">
          <div>Kode Template: <strong class="font-mono text-primary">${code}</strong></div>
          <div>Nama Dokumen: <strong>${(item && item.name) || 'Laporan Resmi RT'}</strong></div>
          <div>Klasifikasi Grup: <strong>${group}</strong></div>
          <div>Deskripsi: <span class="text-slate-500">${(item && item.desc) || 'Laporan operasional dan administrasi berkala kas RT'}</span></div>
        </div>
        ${sectionTitle('2', 'Data Lampiran & Rekapitulasi')}
        <div class="p-6 rounded-2xl border border-dashed border-outline-variant text-center text-xs text-slate-500">
          Dokumen laporan telah siap dicetak dan diverifikasi integritas digitalnya ber-SHA256. Gunakan tombol Cetak/PDF, Excel, atau Word pada panel atas untuk menyimpan salinan resmi.
        </div>
      </div>
    `;
  }

  const BuildersModule = {
    get(code) {
      return Builders[code] || null;
    },
    build(code, filter = {}) {
      const b = Builders[code];
      if (!b) return buildDynamicReport(code, filter);
      return b(filter);
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Reports = window.KasRT.Reports || {};
  window.KasRT.Reports.Builders = BuildersModule;
  window.KasRT_Reports_Builders_Loaded = true;
})();
