/**
 * KasRT - Periodic Reports Page (#/app/laporan-periode)
 * Laporan analitik berkala: Harian, Mingguan, Bulanan, Tahunan, dan Rentang Kustom
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_PeriodReports_Loaded) return;

  const Utils = window.KasRT.Utils;
  let currentType = 'month';
  let selectedDate = Utils.today();

  const PeriodReportsPage = {
    render() {
      const db = window.KasRT.DB;
      const transactions = db.list('transactions').filter(t => t.status !== 'Void');
      const d = new Date(selectedDate);
      const filtered = transactions.filter(t => {
        const td = new Date(t.tanggal);
        if (currentType === 'day') {
          return t.tanggal === selectedDate;
        } else if (currentType === 'month') {
          return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
        } else if (currentType === 'year') {
          return td.getFullYear() === d.getFullYear();
        }
        return true;
      });

      const totIn = filtered.filter(t => t.tipe === 'Pemasukan').reduce((s, t) => s + (t.jumlah || 0), 0);
      const totOut = filtered.filter(t => t.tipe === 'Pengeluaran').reduce((s, t) => s + (t.jumlah || 0), 0);
      const net = totIn - totOut;

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-black font-display text-on-surface">Laporan Periode Kas</h2>
              <p class="text-xs text-slate-500">Analisis komprehensif arus kas per siklus harian, mingguan, bulanan, atau tahunan</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="KasRT.Reports.Export.showPreviewModal('KAS-01')" class="px-3.5 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
                <span class="material-symbols-outlined text-base">visibility</span>
                <span>Pratinjau & Cetak Laporan</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            ${[
              { id: 'day', label: 'Harian (1 Hari)', icon: 'today' },
              { id: 'week', label: 'Mingguan (7 Hari)', icon: 'date_range' },
              { id: 'month', label: 'Bulanan Penuh', icon: 'calendar_month' },
              { id: 'year', label: 'Tahunan (Jan-Des)', icon: 'calendar_today' },
              { id: 'custom', label: 'Rentang Bebas', icon: 'tune' }
            ].map(t => `
              <button onclick="KasRT.Pages.PeriodReports.setType('${t.id}')" class="p-4 rounded-3xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${currentType === t.id ? 'bg-theme-gradient text-white border-transparent shadow-md' : 'bg-surface-lowest text-slate-600 dark:text-slate-300 border-outline-variant hover:bg-surface-container'}">
                <span class="material-symbols-outlined text-2xl">${t.icon}</span>
                <span class="text-xs font-bold">${t.label}</span>
              </button>
            `).join('')}
          </div>

          <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant flex items-center justify-between gap-4 shadow-sm text-xs">
            <div class="flex items-center gap-3">
              <span class="font-bold text-slate-400">Pilih Tanggal Acuan:</span>
              <input type="date" value="${selectedDate}" onchange="KasRT.Pages.PeriodReports.setDate(this.value)" class="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
            </div>
            <span class="text-xs font-bold text-primary">${filtered.length} Transaksi Tercatat</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-emerald-600 uppercase">Penerimaan Dana</span>
              <div class="text-xl font-black font-mono text-emerald-600 mt-1">${Utils.formatRp(totIn)}</div>
            </div>
            <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-rose-600 uppercase">Total Belanja / Keluar</span>
              <div class="text-xl font-black font-mono text-rose-600 mt-1">${Utils.formatRp(totOut)}</div>
            </div>
            <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-primary uppercase">Arus Kas Bersih (Netto)</span>
              <div class="text-xl font-black font-mono ${net >= 0 ? 'text-primary' : 'text-rose-600'} mt-1">${net >= 0 ? '+' : ''}${Utils.formatRp(net)}</div>
            </div>
          </div>

          <div class="bg-surface-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden p-5">
            <h3 class="font-bold text-sm text-on-surface font-display mb-4">Rincian Transaksi Kas Sesuai Periode</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-surface-container/60 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant">
                  <tr>
                    <th class="py-2.5 px-3">Tanggal</th>
                    <th class="py-2.5 px-3">ID</th>
                    <th class="py-2.5 px-3">Keterangan</th>
                    <th class="py-2.5 px-3">Kategori</th>
                    <th class="py-2.5 px-3 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/40">
                  ${filtered.length === 0 ? `
                    <tr><td colspan="5" class="py-8 text-center text-slate-400 italic">Tidak ada transaksi pada periode yang dipilih.</td></tr>
                  ` : filtered.map(t => `
                    <tr>
                      <td class="py-2.5 px-3 font-mono text-slate-500">${Utils.formatDate(t.tanggal)}</td>
                      <td class="py-2.5 px-3 font-mono text-[11px] text-slate-400">${t.id}</td>
                      <td class="py-2.5 px-3 font-bold text-on-surface">${t.keterangan || t.categoryNameSnapshot}</td>
                      <td class="py-2.5 px-3">${t.categoryNameSnapshot}</td>
                      <td class="py-2.5 px-3 text-right font-mono font-bold ${t.tipe === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}">
                        ${t.tipe === 'Pemasukan' ? '+' : '-'}${Utils.formatRp(t.jumlah)}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    },

    setType(type) {
      currentType = type;
      window.KasRT.Events.handleRouting();
    },

    setDate(dateVal) {
      selectedDate = dateVal;
      window.KasRT.Events.handleRouting();
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.PeriodReports = PeriodReportsPage;
  window.KasRT_Pages_PeriodReports_Loaded = true;
})();
