/**
 * KasRT - Audit Trail Page
 * Buku log jejak audit immutable, filter aktivitas petugas, inspeksi data before/after, dan ekspor JSON
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_Audit_Loaded) return;

  const Utils = window.KasRT.Utils;
  let activeSearch = '';

  const AuditPage = {
    render() {
      const auth = window.KasRT.Auth;
      if (!auth || !auth.Permissions.has('view_audit')) {
        return window.KasRT.Shell.renderForbidden('view_audit', '/app/audit');
      }
      const db = window.KasRT.DB;
      const logs = db.list('auditLogs') || [];
      const filtered = logs.filter(l => {
        if (!activeSearch) return true;
        const s = activeSearch.toLowerCase();
        return (l.userName || '').toLowerCase().includes(s) ||
               (l.aksi || '').toLowerCase().includes(s) ||
               (l.collection || '').toLowerCase().includes(s) ||
               (l.recordId || '').toLowerCase().includes(s);
      });

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-black font-display text-on-surface">Log Audit & Jejak Aktivitas</h2>
              <p class="text-xs text-slate-500">Catatan kronologis perubahan data keuangan & administrasi sistem secara permanen (immutable)</p>
            </div>
            <button onclick="KasRT.Pages.Audit.exportJson()" class="px-4 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-surface-container cursor-pointer">
              <span class="material-symbols-outlined text-base">download</span>
              <span>Ekspor Log (.json)</span>
            </button>
          </div>

          <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant flex items-center justify-between gap-4 shadow-sm">
            <div class="relative flex-1 max-w-md">
              <input type="text" placeholder="Cari nama pengguna, aksi, atau ID entitas..." value="${activeSearch}" oninput="KasRT.Pages.Audit.handleSearch(this.value)" class="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs focus:ring-1 focus:ring-primary" />
              <span class="material-symbols-outlined text-slate-400 text-sm absolute left-3 top-2.5">search</span>
            </div>
            <span class="text-xs text-slate-400 font-medium">Tercatat ${logs.length} jejak aktivitas</span>
          </div>

          <div class="bg-surface-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left min-w-[650px]">
              <thead class="bg-surface-container/60 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant tracking-wider">
                <tr>
                  <th class="py-3 px-4">Waktu</th>
                  <th class="py-3 px-4">Pelaksana / User</th>
                  <th class="py-3 px-4">Tindakan (Aksi)</th>
                  <th class="py-3 px-4">Entitas Koleksi</th>
                  <th class="py-3 px-4">ID Dokumen</th>
                  <th class="py-3 px-4 text-center">Rincian Data</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/40 font-mono">
                ${filtered.length === 0 ? `
                  <tr><td colspan="6" class="py-12 text-center text-slate-400 italic">Tidak ada catatan aktivitas yang cocok.</td></tr>
                ` : filtered.map(l => `
                  <tr class="hover:bg-surface-container/30 transition-colors">
                    <td class="py-3 px-4 text-slate-500 whitespace-nowrap">${Utils.formatDateTime(l.timestamp)}</td>
                    <td class="py-3 px-4 font-bold font-sans text-on-surface whitespace-nowrap">${l.userName || 'Sistem'}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-primary border border-indigo-200 dark:border-indigo-800">${l.aksi}</span>
                    </td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-300">${l.collection}</td>
                    <td class="py-3 px-4 text-slate-400">${l.recordId || '-'}</td>
                    <td class="py-3 px-4 text-center">
                      <button onclick="KasRT.Pages.Audit.showDetail('${l.id}')" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-white font-sans text-[11px] font-semibold transition-colors cursor-pointer">
                        Lihat JSON
                      </button>
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

    handleSearch: Utils.debounce((val) => {
      activeSearch = val;
      window.KasRT.Events.handleRouting();
    }, 150),

    showDetail(logId) {
      const db = window.KasRT.DB;
      const log = db.get('auditLogs', logId);
      if (!log) return;

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div>
              <h3 class="text-base font-bold font-display text-on-surface">Detail Jejak Audit (${log.id})</h3>
              <p class="text-xs text-slate-500">${log.aksi} | ${log.userName} | ${Utils.formatDateTime(log.timestamp)}</p>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <div class="space-y-3 text-xs">
            <div>
              <span class="font-bold text-slate-500 block mb-1">Data Lama (Before):</span>
              <pre class="p-3 rounded-2xl bg-surface-container font-mono text-[11px] overflow-x-auto max-h-40 border border-outline-variant">${JSON.stringify(log.dataLama, null, 2) || '(null)'}</pre>
            </div>
            <div>
              <span class="font-bold text-slate-500 block mb-1">Data Baru (After):</span>
              <pre class="p-3 rounded-2xl bg-surface-container font-mono text-[11px] overflow-x-auto max-h-40 border border-outline-variant">${JSON.stringify(log.dataBaru, null, 2) || '(null)'}</pre>
            </div>
          </div>
          <div class="pt-4 border-t border-outline-variant flex justify-end">
            <button onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Tutup</button>
          </div>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'lg' });
    },

    exportJson() {
      const db = window.KasRT.DB;
      const logs = db.list('auditLogs') || [];
      const jsonStr = JSON.stringify(logs, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KasRT_AuditLogs_${Utils.today()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      window.KasRT.UI.showToast('Log audit berhasil diunduh dalam format JSON.', 'success');
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.Audit = AuditPage;
  window.KasRT_Pages_Audit_Loaded = true;
})();
