/**
 * KasRT - Dedicated Database & Storage Real-Time Monitoring Page (#/app/db-monitor)
 * KHUSUS ADMINISTRATOR SISTEM (RBAC Guarded)
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_DBMonitor_Loaded) return;

  const Utils = window.KasRT.Utils;
  let activeLogFilter = 'ALL';
  let activeLogSearch = '';

  const DBMonitorPage = {
    render() {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? auth.user : null;
      if (!auth || (!auth.Permissions.isAdmin(user) && !auth.Permissions.has('view_db_monitor', user))) {
        return window.KasRT.Shell.renderForbidden('view_db_monitor', '/app/db-monitor');
      }

      const monitor = window.KasRT && window.KasRT.DBMonitor;
      const state = monitor ? monitor.getState() : {
        status: 'ONLINE',
        statusLabel: 'Terkoneksi Baik',
        statusColor: 'emerald',
        latencyMs: 12,
        lastChecked: new Date().toISOString(),
        lastSyncTime: null,
        storageEngine: 'LocalStorage Browser (Offline-First)',
        storage: { totalBytes: 0, totalKb: '0', totalMb: '0.00', percentQuota: 0, totalDocuments: 0, totalCollections: 31, topCollections: [] }
      };

      const logs = monitor ? monitor.getActivityLogs({ level: activeLogFilter, search: activeLogSearch }) : [];

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  <span class="material-symbols-outlined text-xs">admin_panel_settings</span>
                  <span>Khusus Administrator Penuh</span>
                </span>
                <span class="text-xs text-slate-400 font-mono">Real-Time Engine</span>
              </div>
              <h2 class="text-xl font-black font-display text-on-surface">Monitoring Basis Data & Storage Real-Time</h2>
              <p class="text-xs text-slate-500">Pantau konektivitas basis data, kapasitas penyimpanan, sinkronisasi server, dan log aktivitas berkala</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <a href="#/app/settings?tab=integrasi" class="px-3.5 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-bold text-xs flex items-center gap-1.5 transition-colors">
                <span class="material-symbols-outlined text-base">hub</span>
                <span>Kredensial Firebase</span>
              </a>
              <button onclick="KasRT.Pages.DBMonitor.handlePingTest()" class="px-3.5 py-2 rounded-xl bg-surface-lowest text-slate-700 dark:text-slate-200 border border-outline-variant hover:bg-surface-container font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-base">network_check</span>
                <span>Uji Ping Koneksi</span>
              </button>
              <button onclick="KasRT.Pages.DBMonitor.handleSync()" id="btn-sync-action" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-opacity cursor-pointer">
                <span class="material-symbols-outlined text-base">cloud_sync</span>
                <span>Sinkronkan ke Server</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Koneksi</span>
                <div class="w-9 h-9 rounded-2xl ${state.status === 'ONLINE' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' : (state.status === 'OFFLINE_LOCAL' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600')} flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">${state.status === 'ONLINE' ? 'wifi' : (state.status === 'OFFLINE_LOCAL' ? 'wifi_off' : 'cloud_off')}</span>
                </div>
              </div>
              <div class="my-2">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full ${state.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : (state.status === 'OFFLINE_LOCAL' ? 'bg-amber-500' : 'bg-rose-500')}"></span>
                  <span class="text-lg font-black font-display ${state.status === 'ONLINE' ? 'text-emerald-600 dark:text-emerald-400' : (state.status === 'OFFLINE_LOCAL' ? 'text-amber-600' : 'text-rose-600')}">
                    ${state.statusLabel}
                  </span>
                </div>
                <div class="text-[11px] font-mono text-slate-400 mt-0.5">Latensi Ping: <strong class="text-on-surface font-bold">${state.latencyMs} ms</strong></div>
              </div>
              <div class="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Update: ${Utils.formatDateTime(state.lastChecked)}</span>
              </div>
            </div>

            <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ukuran Storage</span>
                <div class="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-primary flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">storage</span>
                </div>
              </div>
              <div class="my-2">
                <div class="text-2xl font-black font-mono text-on-surface">${state.storage.totalKb} KB</div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500 ${state.storage.percentQuota > 80 ? 'bg-rose-500' : (state.storage.percentQuota > 50 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${Math.max(4, state.storage.percentQuota)}%"></div>
                </div>
              </div>
              <div class="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Total: ${state.storage.totalMb} MB</span>
                <span class="font-bold text-primary">${state.storage.percentQuota}% Kuota</span>
              </div>
            </div>

            <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume Data</span>
                <div class="w-9 h-9 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">table_chart</span>
                </div>
              </div>
              <div class="my-2">
                <div class="text-2xl font-black font-mono text-on-surface">${state.storage.totalDocuments} Dokumen</div>
                <div class="text-[11px] text-slate-400 mt-0.5">Tersimpan dalam ${state.storage.totalCollections} tabel koleksi</div>
              </div>
              <div class="pt-2 border-t border-outline-variant/60 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                <span>Struktur Skema Konsisten</span>
              </div>
            </div>

            <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Sinkronisasi</span>
                <div class="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">cloud_done</span>
                </div>
              </div>
              <div class="my-2">
                <div class="text-base font-bold text-on-surface">
                  ${state.lastSyncTime ? Utils.relTime(state.lastSyncTime) : 'Belum Pernah'}
                </div>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                  ${state.lastSyncTime ? Utils.formatDateTime(state.lastSyncTime) : 'Mode Offline Lokal'}
                </div>
              </div>
              <div class="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[11px] text-slate-400">
                <span class="font-bold text-primary">Lokal <-> Server</span>
                <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-surface-container">Two-Way</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-7 bg-surface-lowest rounded-3xl border border-outline-variant p-6 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-bold text-sm text-on-surface font-display">Rincian Penggunaan Storage Koleksi</h3>
                  <p class="text-xs text-slate-500">Pemantauan volume dan memori dokumen per entitas database</p>
                </div>
                <span class="text-xs font-mono font-bold text-slate-400">${state.storage.totalCollections} Koleksi</span>
              </div>
              <div class="space-y-3 pt-2">
                ${state.storage.topCollections.map(col => `
                  <div class="p-3 rounded-2xl bg-surface-container/30 border border-outline-variant/50">
                    <div class="flex items-center justify-between mb-1.5 text-xs">
                      <div class="flex items-center gap-2">
                        <span class="font-bold font-mono text-on-surface">${col.name}</span>
                        <span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-surface-container text-slate-500">${col.count} data</span>
                      </div>
                      <div class="flex items-center gap-2 font-mono">
                        <span class="font-bold text-on-surface">${col.formatted}</span>
                        <span class="text-[10px] text-slate-400">(${col.percentage}%)</span>
                      </div>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div class="h-full bg-primary rounded-full transition-all" style="width: ${Math.max(2, col.percentage)}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="pt-3 border-t border-outline-variant/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Rekomendasi: Lakukan pencadangan berkala untuk menjaga kebersihan data.</span>
                <a href="#/app/import-export" class="font-bold text-primary hover:underline">Impor / Ekspor →</a>
              </div>
            </div>

            <div class="lg:col-span-5 space-y-5">
              <div class="bg-surface-lowest rounded-3xl border border-outline-variant p-6 shadow-sm space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                    <span class="material-symbols-outlined text-xl">sync_alt</span>
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-on-surface">Sinkronisasi Lokal <-> Server</h3>
                    <p class="text-[11px] text-slate-500">Unggah seluruh data lokal ke Firebase Firestore</p>
                  </div>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Fitur ini akan menyelaraskan 31 koleksi dari memori perangkat ke basis data cloud serverless agar data dapat diakses multi-perangkat.
                </p>
                <div class="pt-2">
                  <button onclick="KasRT.Pages.DBMonitor.handleSync()" class="w-full py-2.5 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span class="material-symbols-outlined text-base">cloud_upload</span>
                    <span>Jalankan Sinkronisasi Penuh Sekarang</span>
                  </button>
                </div>
              </div>

              <div class="bg-surface-lowest rounded-3xl border border-outline-variant p-6 shadow-sm space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center">
                    <span class="material-symbols-outlined text-xl">wifi_tethering_error</span>
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-on-surface">Uji Sistem Notifikasi Koneksi</h3>
                    <p class="text-[11px] text-slate-500">Simulasikan kegagalan jaringan & pemulihan</p>
                  </div>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Gunakan tombol ini untuk menguji bagaimana sistem bereaksi memunculkan banner peringatan dan notifikasi jika koneksi terputus.
                </p>
                <div class="pt-2 flex gap-2">
                  <button onclick="KasRT.Pages.DBMonitor.toggleSimulation()" class="flex-1 py-2 px-3 rounded-xl border border-outline-variant hover:bg-surface-container text-xs font-bold transition-colors cursor-pointer ${state.isSimulatingDisconnect ? 'bg-rose-50 text-rose-700 border-rose-300' : 'text-slate-700 dark:text-slate-200'}">
                    ${state.isSimulatingDisconnect ? '✕ Hentikan Simulasi' : '⚡ Simulasi Putus Koneksi'}
                  </button>
                </div>
              </div>

              <div class="bg-rose-50/60 dark:bg-rose-950/30 rounded-3xl border border-rose-200 dark:border-rose-900 p-6 shadow-sm space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-xl">delete_forever</span>
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-rose-700 dark:text-rose-300">Reset Semua Data Basis Data</h3>
                    <p class="text-[11px] text-rose-500 font-semibold">Tindakan Destruktif | Khusus Superadmin</p>
                  </div>
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Mengosongkan seluruh isi database (lokal & cloud), kemudian mengembalikan dataset ke struktur awal. Membutuhkan verifikasi teks.
                </p>
                <div class="pt-1">
                  <button onclick="KasRT.Pages.DBMonitor.handleResetDatabase()" class="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <span class="material-symbols-outlined text-base">warning</span>
                    <span>Reset Total Basis Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-surface-lowest rounded-3xl border border-outline-variant p-6 shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="font-bold text-base text-on-surface font-display flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-xl">history</span>
                  <span>Log Riwayat Aktivitas Sistem & Konektivitas</span>
                </h3>
                <p class="text-xs text-slate-500">Mencatat event pemeriksaan koneksi, sinkronisasi data, gangguan jaringan, dan reset sistem secara berkala</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <select onchange="KasRT.Pages.DBMonitor.filterLogs(this.value)" class="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs font-bold text-on-surface cursor-pointer">
                  <option value="ALL" ${activeLogFilter === 'ALL' ? 'selected' : ''}>Semua Level</option>
                  <option value="INFO" ${activeLogFilter === 'INFO' ? 'selected' : ''}>INFO</option>
                  <option value="SUCCESS" ${activeLogFilter === 'SUCCESS' ? 'selected' : ''}>SUCCESS</option>
                  <option value="WARNING" ${activeLogFilter === 'WARNING' ? 'selected' : ''}>WARNING</option>
                  <option value="ERROR" ${activeLogFilter === 'ERROR' ? 'selected' : ''}>ERROR</option>
                </select>
                <div class="relative w-44">
                  <input type="text" placeholder="Cari log..." value="${activeLogSearch}" oninput="KasRT.Pages.DBMonitor.searchLogs(this.value)" class="w-full pl-7 pr-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs focus:ring-1 focus:ring-primary" />
                  <span class="material-symbols-outlined text-slate-400 text-xs absolute left-2 top-2">search</span>
                </div>
                <button onclick="KasRT.Pages.DBMonitor.exportLogsJson()" class="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-slate-200 dark:hover:bg-slate-800 text-on-surface font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-sm">download</span>
                  <span>Unduh JSON</span>
                </button>
              </div>
            </div>
            <div class="overflow-x-auto rounded-2xl border border-outline-variant">
              <table class="w-full text-xs text-left min-w-[620px]">
                <thead class="bg-surface-container/60 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant tracking-wider">
                  <tr>
                    <th class="py-2.5 px-3">Waktu</th>
                    <th class="py-2.5 px-3 text-center">Level</th>
                    <th class="py-2.5 px-3">Tipe Event</th>
                    <th class="py-2.5 px-3">Uraian / Pesan Aktivitas</th>
                    <th class="py-2.5 px-3">Sumber</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/40 font-mono">
                  ${logs.length === 0 ? `
                    <tr><td colspan="5" class="py-10 text-center text-slate-400 italic">Belum ada catatan log aktivitas yang cocok dengan filter.</td></tr>
                  ` : logs.map(l => {
                    const levelClass = {
                      SUCCESS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                      INFO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
                      WARNING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                      ERROR: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }[l.level] || 'bg-slate-100 text-slate-800';
                    return `
                      <tr class="hover:bg-surface-container/30 transition-colors">
                        <td class="py-2.5 px-3 text-slate-500 whitespace-nowrap">${Utils.formatDateTime(l.timestamp)}</td>
                        <td class="py-2.5 px-3 text-center whitespace-nowrap">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${levelClass}">${l.level}</span>
                        </td>
                        <td class="py-2.5 px-3 font-bold text-primary whitespace-nowrap">${l.type}</td>
                        <td class="py-2.5 px-3 font-sans text-on-surface">${l.message}</td>
                        <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap">${l.source || 'KasRT'}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    },

    async handlePingTest() {
      const monitor = window.KasRT && window.KasRT.DBMonitor;
      if (!monitor) return;
      const res = await monitor.checkHealth();
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast(`Ping selesai: ${res.statusLabel} (${res.latencyMs} ms)`, res.status === 'ONLINE' ? 'success' : 'warning');
      }
      window.KasRT.Events.handleRouting();
    },

    async handleSync() {
      const btn = document.getElementById('btn-sync-action');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined text-base animate-spin">refresh</span><span>Menyinkronkan...</span>`;
      }
      try {
        const monitor = window.KasRT && window.KasRT.DBMonitor;
        await monitor.syncLocalToServer();
        window.KasRT.Events.handleRouting();
      } catch (e) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(e.message, 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span class="material-symbols-outlined text-base">cloud_sync</span><span>Sinkronkan ke Server</span>`;
        }
      }
    },

    toggleSimulation() {
      const monitor = window.KasRT && window.KasRT.DBMonitor;
      if (!monitor) return;
      monitor.toggleSimulationDisconnect();
      window.KasRT.Events.handleRouting();
    },

    async handleResetDatabase() {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? auth.user : null;
      if (!auth || !auth.Permissions.isAdmin(user)) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Akses Ditolak: Anda tidak memiliki hak Administrator Penuh.', 'error');
        return;
      }
      const confirmed = await new Promise((resolve) => {
        const html = `
          <div class="p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center">
                <span class="material-symbols-outlined">delete_forever</span>
              </div>
              <h3 class="text-lg font-bold font-display text-on-surface">Konfirmasi Reset Total Basis Data</h3>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              PERINGATAN TINGKAT TINGGI: Tindakan ini akan mengosongkan seluruh data transaksi, tagihan, cicilan, dan inventaris, lalu men-seed ulang data default RT 01 Harmoni.
            </p>
            <div>
              <p class="text-xs text-rose-500 font-semibold mb-2">Ketik <code class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold">RESET TOTAL BASIS DATA</code> untuk mengonfirmasi:</p>
              <input type="text" id="reset-confirm-input" placeholder="Ketik RESET TOTAL BASIS DATA..." class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary font-semibold" autofocus />
            </div>
            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container/50 border border-outline-variant cursor-pointer text-xs font-semibold select-none">
              <input type="checkbox" id="reset-users-checkbox" class="rounded text-rose-600 w-4 h-4 cursor-pointer" />
              <span>Ikut reset data pengguna sistem (akun login & role kustom)</span>
            </label>
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
              <button id="btn-reset-cancel" class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                Batal
              </button>
              <button id="btn-reset-ok" class="px-5 py-2 text-sm font-bold text-white rounded-xl shadow-md bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer">
                Reset Sekarang
              </button>
            </div>
          </div>
        `;
        window.KasRT.UI.openModal(html, { size: 'sm' });
        const input = document.getElementById('reset-confirm-input');
        const checkbox = document.getElementById('reset-users-checkbox');
        document.getElementById('btn-reset-cancel')?.addEventListener('click', () => {
          window.KasRT.UI.closeModal();
          resolve(null);
        });
        document.getElementById('btn-reset-ok')?.addEventListener('click', () => {
          const val = input ? input.value.trim() : '';
          if (val !== 'RESET TOTAL BASIS DATA') {
            window.KasRT.UI.showToast('Teks konfirmasi harus tepat: "RESET TOTAL BASIS DATA"', 'warning');
            return;
          }
          const resetUsers = checkbox ? checkbox.checked : false;
          window.KasRT.UI.closeModal();
          resolve({ resetUsers });
        });
        input?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            document.getElementById('btn-reset-ok')?.click();
          }
        });
      });

      if (confirmed) {
        try {
          const monitor = window.KasRT && window.KasRT.DBMonitor;
          await monitor.resetAllDatabase('RESET TOTAL BASIS DATA', { resetUsers: confirmed.resetUsers });
          if (window.KasRT.UI) {
            window.KasRT.UI.showToast('Seluruh basis data telah berhasil di-reset ke kondisi awal!', 'info');
          }
          window.KasRT.Events.navigate('#/app/dashboard');
        } catch (err) {
          if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
        }
      }
    },

    filterLogs(level) {
      activeLogFilter = level;
      window.KasRT.Events.handleRouting();
    },

    searchLogs: Utils.debounce((query) => {
      activeLogSearch = query;
      window.KasRT.Events.handleRouting();
    }, 150),

    exportLogsJson() {
      const monitor = window.KasRT && window.KasRT.DBMonitor;
      const logs = monitor ? monitor.getActivityLogs() : [];
      const jsonStr = JSON.stringify(logs, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KasRT_SystemLogs_${Utils.today()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      window.KasRT.UI.showToast('Log aktivitas sistem berhasil diunduh.', 'success');
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.DBMonitor = DBMonitorPage;
  window.KasRT_Pages_DBMonitor_Loaded = true;
})();
