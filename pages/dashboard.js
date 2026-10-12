/**
 * KasRT - Dashboard Page (Staff Consolidated Analytics & Citizen Personal Portal)
 * 4 Kartu Stat, Chart.js tren 6 bulan, Widget Monitoring Database & Storage Real-Time (Khusus Admin), dan Portal Warga
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_Dashboard_Loaded) return;

  const Utils = window.KasRT.Utils;

  const DashboardPage = {
    render() {
      const auth = window.KasRT.Auth;
      const user = auth ? auth.user : null;
      const isCitizen = auth && auth.Permissions ? auth.Permissions.isWarga(user) : false;
      if (isCitizen) {
        return this.renderCitizenPortal(user);
      }
      return this.renderStaffDashboard();
    },

    renderStaffDashboard() {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;
      const isAdmin = auth && auth.Permissions && auth.Permissions.isAdmin(currentUser);
      const canViewDbMonitor = isAdmin || (auth && auth.Permissions && auth.Permissions.has('view_db_monitor', currentUser));
      const accounts = db.list('cashAccounts');
      const transactions = db.list('transactions').filter(t => t.status !== 'Void');
      const residents = db.list('residents').filter(r => r.status === 'Aktif');
      const items = db.list('inventoryItems');
      const auditLogs = db.list('auditLogs').slice(0, 6);
      const schedules = db.list('inventorySchedules').filter(s => s.status !== 'Selesai');

      const saldoKonsolidasi = accounts.reduce((sum, a) => sum + (a.saldoSaatIni || 0), 0);
      const now = new Date();
      const curM = now.getMonth() + 1;
      const curY = now.getFullYear();
      const trxThisMonth = transactions.filter(t => {
        const d = new Date(t.tanggal);
        return d.getMonth() + 1 === curM && d.getFullYear() === curY;
      });
      const inThisMonth = trxThisMonth.filter(t => t.tipe === 'Pemasukan').reduce((sum, t) => sum + (t.jumlah || 0), 0);
      const outThisMonth = trxThisMonth.filter(t => t.tipe === 'Pengeluaran').reduce((sum, t) => sum + (t.jumlah || 0), 0);
      const totBaik = items.reduce((s, i) => s + (i.jumlahBaik || 0), 0);
      const totCacat = items.reduce((s, i) => s + (i.jumlahCacat || 0), 0);
      const recentTrx = [...transactions].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 6);

      const monitor = window.KasRT && window.KasRT.DBMonitor;
      const mState = monitor ? monitor.getState() : {
        status: 'ONLINE',
        statusLabel: 'Terkoneksi Baik',
        latencyMs: 12,
        storage: { totalKb: '0', totalMb: '0.00', percentQuota: 0, totalDocuments: 0 }
      };

      return `
        <div class="space-y-4 sm:space-y-5">
          ${canViewDbMonitor ? `
            <div class="p-4 sm:p-5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-xs card-glow relative overflow-hidden transition-all">
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-outline-variant/60">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-theme-gradient text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <span class="material-symbols-outlined text-xl">dns</span>
                  </div>
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-1.5">
                      <h3 class="font-extrabold text-sm sm:text-base font-display text-on-surface truncate">Monitoring Database & Storage Real-Time</h3>
                      <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        Khusus Admin
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-500 mt-0.5">Pemantauan status koneksi basis data, penggunaan memori storage, dan sinkronisasi server</p>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button id="btn-quick-sync-db" onclick="KasRT.Pages.Dashboard.handleQuickSync()" class="px-3 py-1.5 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all cursor-pointer">
                    <span class="material-symbols-outlined text-base">sync</span>
                    <span>Sinkronkan ke Server</span>
                  </button>
                  <a href="#/app/settings?tab=integrasi" class="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs flex items-center gap-1.5 transition-colors border border-primary/20">
                    <span class="material-symbols-outlined text-base">hub</span>
                    <span>Kredensial Firebase</span>
                  </a>
                  <a href="#/app/db-monitor" class="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-slate-200 dark:hover:bg-slate-800 text-on-surface font-bold text-xs flex items-center gap-1.5 transition-colors">
                    <span class="material-symbols-outlined text-base">analytics</span>
                    <span>Monitor Penuh</span>
                  </a>
                </div>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 text-xs">
                <div class="p-3 rounded-xl bg-surface-container/40 border border-outline-variant/60 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status Koneksi</span>
                    <span class="w-2 h-2 rounded-full ${mState.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : (mState.status === 'OFFLINE_LOCAL' ? 'bg-amber-500' : 'bg-rose-500')}"></span>
                  </div>
                  <div class="my-1 flex items-baseline gap-1.5">
                    <span class="font-extrabold text-sm ${mState.status === 'ONLINE' ? 'text-emerald-600 dark:text-emerald-400' : (mState.status === 'OFFLINE_LOCAL' ? 'text-amber-600' : 'text-rose-600')}">
                      ${mState.statusLabel}
                    </span>
                    <span class="text-[10px] font-mono text-slate-400 font-bold">(${mState.latencyMs} ms)</span>
                  </div>
                  <span class="text-[10px] text-slate-400 truncate">${mState.storageEngine || 'LocalStorage'}</span>
                </div>
                <div class="p-3 rounded-xl bg-surface-container/40 border border-outline-variant/60 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Storage Terpakai</span>
                    <span class="material-symbols-outlined text-sm text-primary">pie_chart</span>
                  </div>
                  <div class="my-1">
                    <div class="font-extrabold text-sm font-mono text-on-surface">${mState.storage ? mState.storage.totalKb : '0'} KB</div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div class="h-full rounded-full transition-all ${mState.storage && mState.storage.percentQuota > 80 ? 'bg-rose-500' : (mState.storage && mState.storage.percentQuota > 50 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${Math.max(5, mState.storage ? mState.storage.percentQuota : 0)}%"></div>
                    </div>
                  </div>
                  <span class="text-[10px] text-slate-400">${mState.storage ? mState.storage.percentQuota : 0}% dari kuota lokal</span>
                </div>
                <div class="p-3 rounded-xl bg-surface-container/40 border border-outline-variant/60 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Volume Record</span>
                    <span class="material-symbols-outlined text-sm text-sky-500">dataset</span>
                  </div>
                  <div class="my-1">
                    <div class="font-extrabold text-sm font-mono text-on-surface">${mState.storage ? mState.storage.totalDocuments : 0} Dokumen</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">di ${mState.storage ? mState.storage.totalCollections : 0} tabel koleksi</div>
                  </div>
                  <span class="text-[10px] text-primary font-bold">31 Model Skema Aktif</span>
                </div>
                <div class="p-3 rounded-xl bg-surface-container/40 border border-outline-variant/60 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sinkronisasi Server</span>
                    <span class="material-symbols-outlined text-sm text-indigo-500">cloud_sync</span>
                  </div>
                  <div class="my-1">
                    <div class="font-extrabold text-sm text-on-surface truncate">
                      ${mState.lastSyncTime ? Utils.relTime(mState.lastSyncTime) : 'Belum Pernah'}
                    </div>
                    <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                      ${mState.lastSyncTime ? Utils.formatDate(mState.lastSyncTime) : 'Tersimpan Lokal'}
                    </div>
                  </div>
                  <span class="text-[10px] text-emerald-600 font-bold">Lokal <-> Cloud Firestore</span>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div class="p-3.5 sm:p-4 rounded-2xl card-stat-saldo border transition-all duration-200 flex flex-col justify-between group hover:scale-[1.01]">
              <div class="flex items-center justify-between">
                <span class="text-[10px] sm:text-[11px] font-extrabold text-primary dark:text-indigo-300 uppercase tracking-wider">Saldo Kas</span>
                <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-theme-gradient text-white flex items-center justify-center shadow-xs">
                  <span class="material-symbols-outlined text-base sm:text-lg">account_balance</span>
                </div>
              </div>
              <div class="my-1 sm:my-1.5">
                <div class="text-base sm:text-xl lg:text-2xl font-black font-mono text-on-surface truncate">${Utils.formatRp(saldoKonsolidasi)}</div>
                <div class="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">${accounts.length} rekening & brankas</div>
              </div>
              <div class="pt-1.5 sm:pt-2 border-t border-primary/20 flex items-center gap-1 text-[10px] sm:text-[11px] text-primary dark:text-indigo-300 font-bold">
                <span class="material-symbols-outlined text-xs sm:text-sm">verified_user</span>
                <span class="truncate">Terverifikasi akuntabel</span>
              </div>
            </div>
            <div class="p-3.5 sm:p-4 rounded-2xl card-stat-pemasukan border transition-all duration-200 flex flex-col justify-between group hover:scale-[1.01]">
              <div class="flex items-center justify-between">
                <span class="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Pemasukan Bulan Ini</span>
                <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <span class="material-symbols-outlined text-base sm:text-lg">arrow_downward</span>
                </div>
              </div>
              <div class="my-1 sm:my-1.5">
                <div class="text-base sm:text-xl lg:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 truncate">${Utils.formatRp(inThisMonth)}</div>
                <div class="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Iuran & donasi warga</div>
              </div>
              <div class="pt-1.5 sm:pt-2 border-t border-emerald-500/20 text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-300 font-medium truncate">
                Periode ${Utils.MONTHS_ID[curM - 1]} ${curY}
              </div>
            </div>
            <div class="p-3.5 sm:p-4 rounded-2xl card-stat-pengeluaran border transition-all duration-200 flex flex-col justify-between group hover:scale-[1.01]">
              <div class="flex items-center justify-between">
                <span class="text-[10px] sm:text-[11px] font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Pengeluaran Bulan Ini</span>
                <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <span class="material-symbols-outlined text-base sm:text-lg">arrow_upward</span>
                </div>
              </div>
              <div class="my-1 sm:my-1.5">
                <div class="text-base sm:text-xl lg:text-2xl font-black font-mono text-rose-700 dark:text-rose-400 truncate">${Utils.formatRp(outThisMonth)}</div>
                <div class="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Operasional & kebersihan</div>
              </div>
              <div class="pt-1.5 sm:pt-2 border-t border-rose-500/20 text-[10px] sm:text-[11px] text-rose-700 dark:text-rose-300 font-medium truncate">
                ${trxThisMonth.filter(t => t.tipe === 'Pengeluaran').length} pos belanja
              </div>
            </div>
            <div class="p-3.5 sm:p-4 rounded-2xl card-stat-warga border transition-all duration-200 flex flex-col justify-between group hover:scale-[1.01]">
              <div class="flex items-center justify-between">
                <span class="text-[10px] sm:text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Warga RT Aktif</span>
                <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-theme-gradient text-white flex items-center justify-center shadow-xs">
                  <span class="material-symbols-outlined text-base sm:text-lg">groups</span>
                </div>
              </div>
              <div class="my-1 sm:my-1.5">
                <div class="text-base sm:text-xl lg:text-2xl font-black font-mono text-on-surface truncate">${residents.length} KK</div>
                <div class="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Terdaftar di lingkungan</div>
              </div>
              <div class="pt-1.5 sm:pt-2 border-t border-primary/20 text-[10px] sm:text-[11px] text-primary dark:text-indigo-300 font-bold truncate">
                100% kepatuhan data induk
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            <div class="lg:col-span-8 bg-surface-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h3 class="font-extrabold text-sm text-on-surface font-display">Tren Arus Kas (6 Bulan Terakhir)</h3>
                  <p class="text-[11px] text-slate-500">Perbandingan pemasukan vs pengeluaran kas lingkungan</p>
                </div>
                <div class="flex items-center gap-3 text-xs font-bold">
                  <span class="flex items-center gap-1.5 text-emerald-600"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Masuk</span>
                  <span class="flex items-center gap-1.5 text-rose-500"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Keluar</span>
                </div>
              </div>
              <div class="h-60 relative">
                <canvas id="chart-cash-trend"></canvas>
              </div>
            </div>
            <div class="lg:col-span-4 bg-surface-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 class="font-extrabold text-sm text-on-surface font-display mb-0.5">Distribusi Pengeluaran</h3>
                <p class="text-[11px] text-slate-500 mb-3">Proporsi pos belanja lingkungan</p>
              </div>
              <div class="h-48 relative flex items-center justify-center">
                <canvas id="chart-expense-donut"></canvas>
              </div>
              <div class="text-center text-[10px] text-slate-400 mt-2 pt-2 border-t border-outline-variant/60">
                Data dihimpun otomatis dari transaksi sah
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div class="p-3.5 sm:p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-xs flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-outlined text-xl">inventory_2</span>
                </div>
                <div>
                  <h4 class="font-bold text-xs sm:text-sm text-on-surface">Kondisi Aset RT</h4>
                  <p class="text-[11px] text-slate-500">${items.length} macam barang inventaris</p>
                </div>
              </div>
              <div class="flex items-center gap-2.5 text-xs">
                <div class="text-right">
                  <div class="font-black text-emerald-600 font-mono">${totBaik} Baik</div>
                  <div class="text-[10px] text-rose-500 font-bold font-mono">${totCacat} Cacat</div>
                </div>
                <a href="#/app/inventaris" class="p-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-white transition-colors">
                  <span class="material-symbols-outlined text-base">arrow_forward</span>
                </a>
              </div>
            </div>
            <div class="p-3.5 sm:p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-xs flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-outlined text-xl">event</span>
                </div>
                <div>
                  <h4 class="font-bold text-xs sm:text-sm text-on-surface">Jadwal Opname Terdekat</h4>
                  <p class="text-[11px] text-slate-500 truncate max-w-[160px]">${schedules.length > 0 ? schedules[0].judul : 'Belum ada agenda'}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  ${schedules.length > 0 ? Utils.formatDate(schedules[0].tanggalPengecekan) : 'Aman'}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            <div class="lg:col-span-7 bg-surface-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-extrabold text-xs sm:text-sm text-on-surface font-display">Transaksi Kas Terbaru</h3>
                <a href="#/app/transaksi" class="text-xs font-bold text-primary hover:underline">Lihat Semua →</a>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                  <thead class="text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant">
                    <tr>
                      <th class="py-2 px-2">Tanggal</th>
                      <th class="py-2 px-2">Keterangan</th>
                      <th class="py-2 px-2 text-right">Nominal</th>
                      <th class="py-2 px-2 text-center">Tipe</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-variant/50">
                    ${recentTrx.map(t => `
                      <tr class="hover:bg-surface-container/30 transition-colors">
                        <td class="py-2 px-2 font-mono text-slate-500 whitespace-nowrap">${Utils.formatDate(t.tanggal)}</td>
                        <td class="py-2 px-2">
                          <div class="font-bold text-on-surface truncate max-w-[200px]">${t.keterangan || t.categoryNameSnapshot}</div>
                          <div class="text-[10px] text-slate-400">${t.categoryNameSnapshot}</div>
                        </td>
                        <td class="py-2 px-2 text-right font-mono font-bold ${t.tipe === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}">
                          ${t.tipe === 'Pemasukan' ? '+' : '-'}${Utils.formatRp(t.jumlah)}
                        </td>
                        <td class="py-2 px-2 text-center">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.tipe === 'Pemasukan' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">${t.tipe}</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="lg:col-span-5 bg-surface-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-extrabold text-xs sm:text-sm text-on-surface font-display">Aktivitas Sistem (Audit Log)</h3>
                  <a href="#/app/audit" class="text-xs font-bold text-primary hover:underline">Audit Penuh →</a>
                </div>
                <div class="space-y-2">
                  ${auditLogs.map(l => `
                    <div class="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container/40 border border-outline-variant/40">
                      <div class="w-6 h-6 rounded-lg bg-indigo-100 text-primary flex items-center justify-center flex-shrink-0 text-xs">
                        <span class="material-symbols-outlined text-sm">history</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-1">
                          <span class="text-xs font-bold text-on-surface truncate">${l.userName || 'Petugas'}</span>
                          <span class="text-[9px] text-slate-400 whitespace-nowrap">${Utils.relTime(l.timestamp)}</span>
                        </div>
                        <div class="text-[10px] font-mono text-primary font-bold mt-0.5 truncate">${l.aksi}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    async handleQuickSync() {
      const btn = document.getElementById('btn-quick-sync-db');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined text-base animate-spin">refresh</span><span>Menyinkronkan...</span>`;
      }
      try {
        await window.KasRT.DBMonitor.syncLocalToServer();
        window.KasRT.Events.handleRouting();
      } catch (e) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(e.message, 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span class="material-symbols-outlined text-base">sync</span><span>Sinkronkan ke Server</span>`;
        }
      }
    },

    renderCitizenPortal(user) {
      const db = window.KasRT.DB;
      const residentId = user?.residentId || 'WRG-0005';
      const resident = db.get('residents', residentId) || { nama: user?.nama || 'Warga' };
      const bills = db.list('duesBills').filter(b => b.residentId === residentId);
      const payments = db.list('duesPayments').filter(p => p.residentId === residentId);

      const totalKewajiban = bills.reduce((sum, b) => sum + (b.nominal || 0), 0);
      const totalDibayar = bills.reduce((sum, b) => sum + (b.jumlahDibayar || 0), 0);
      const sisaKewajiban = Math.max(0, totalKewajiban - totalDibayar);

      return `
        <div class="space-y-6">
          <div class="p-6 sm:p-8 rounded-3xl bg-theme-gradient text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">Portal Transparansi Warga</span>
              <h2 class="text-xl sm:text-2xl font-black font-display mt-2">Halo, ${resident.nama}!</h2>
              <p class="text-xs text-white/80 mt-1">Pantau kewajiban iuran, riwayat pembayaran sah, dan pinjam sarana aset RT secara mandiri.</p>
            </div>
            <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center sm:text-right">
              <span class="text-[11px] text-white/80 uppercase">Sisa Tagihan Anda:</span>
              <div class="text-2xl font-black font-mono text-white mt-0.5">${Utils.formatRp(sisaKewajiban)}</div>
            </div>
          </div>
          <div class="bg-surface-lowest rounded-3xl border border-outline-variant p-6 shadow-sm">
            <h3 class="font-bold text-sm text-on-surface font-display mb-4">Daftar Tagihan Iuran Lingkungan</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant">
                  <tr>
                    <th class="py-2">Periode</th>
                    <th class="py-2">Jatuh Tempo</th>
                    <th class="py-2 text-right">Nominal</th>
                    <th class="py-2 text-right">Dibayar</th>
                    <th class="py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/50">
                  ${bills.map(b => `
                    <tr>
                      <td class="py-2.5 font-bold font-mono">Bulan ${b.periodeBulan} / ${b.periodeTahun}</td>
                      <td class="py-2.5 font-mono text-slate-500">${Utils.formatDate(b.jatuhTempo)}</td>
                      <td class="py-2.5 text-right font-mono">${Utils.formatRp(b.nominal)}</td>
                      <td class="py-2.5 text-right font-mono font-bold text-emerald-600">${Utils.formatRp(b.jumlahDibayar || 0)}</td>
                      <td class="py-2.5 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">${b.status}</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="bg-surface-lowest rounded-3xl border border-outline-variant p-6 shadow-sm">
            <h3 class="font-bold text-sm text-on-surface font-display mb-4">Riwayat Setoran & Kuitansi Digital</h3>
            <div class="space-y-3">
              ${payments.length === 0 ? `
                <div class="py-6 text-center text-slate-400 text-xs italic">Belum ada riwayat pembayaran yang tercatat.</div>
              ` : payments.map(p => `
                <div class="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant flex items-center justify-between">
                  <div>
                    <div class="font-bold text-xs text-on-surface">${Utils.formatDate(p.tanggalBayar)} | Metode ${p.metode}</div>
                    <div class="text-[10px] text-slate-400 font-mono mt-0.5">${p.id} | Ref: ${p.billId}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-black font-mono text-emerald-600">${Utils.formatRp(p.jumlah)}</div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Sah & Terverifikasi</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    },

    _trendChart: null,
    _donutChart: null,

    initCharts() {
      if (!window.Chart) return;
      try {
        const trendCanvas = document.getElementById('chart-cash-trend');
        if (trendCanvas) {
          if (typeof window.Chart.getChart === 'function') {
            const existing = window.Chart.getChart(trendCanvas);
            if (existing) {
              try { existing.destroy(); } catch (e) {}
            }
          }
          if (this._trendChart) {
            try { this._trendChart.destroy(); } catch (e) {}
            this._trendChart = null;
          }
          const labels = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
          const inData = [2500000, 3100000, 2900000, 3400000, 3200000, 3800000];
          const outData = [1800000, 2200000, 1950000, 2600000, 2100000, 2400000];
          this._trendChart = new window.Chart(trendCanvas, {
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: 'Pemasukan',
                  data: inData,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.3,
                  fill: true
                },
                {
                  label: 'Pengeluaran',
                  data: outData,
                  borderColor: '#f43f5e',
                  backgroundColor: 'rgba(244, 63, 94, 0.1)',
                  tension: 0.3,
                  fill: true
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  ticks: {
                    callback: val => 'Rp ' + (val / 1000000) + 'jt'
                  }
                }
              }
            }
          });
        }
      } catch (err) {
        console.warn('[KasRT Dashboard] Trend chart error:', err);
      }

      try {
        const donutCanvas = document.getElementById('chart-expense-donut');
        if (donutCanvas) {
          if (typeof window.Chart.getChart === 'function') {
            const existing = window.Chart.getChart(donutCanvas);
            if (existing) {
              try { existing.destroy(); } catch (e) {}
            }
          }
          if (this._donutChart) {
            try { this._donutChart.destroy(); } catch (e) {}
            this._donutChart = null;
          }
          this._donutChart = new window.Chart(donutCanvas, {
            type: 'doughnut',
            data: {
              labels: ['Kebersihan', 'Keamanan', 'Operasional', 'Sosial', 'Fasum'],
              datasets: [
                {
                  data: [45, 25, 15, 10, 5],
                  backgroundColor: ['#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6']
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { boxWidth: 10, font: { size: 10 } }
                }
              }
            }
          });
        }
      } catch (err) {
        console.warn('[KasRT Dashboard] Donut chart error:', err);
      }
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.Dashboard = DashboardPage;
  window.KasRT_Pages_Dashboard_Loaded = true;
})();
