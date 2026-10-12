/**
 * KasRT - Comprehensive Settings Page (10 Tabs + Firebase Integration & Security Audit)
 * Termasuk Tab Khusus "Sistem / Integrasi" (Kredensial Firebase) dengan validasi akses ketat (Admin Only)
 * Diperbarui: Penanganan Landing Mode (Produksi Resmi vs Demo) instan & sinkron
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_Settings_Loaded) return;

  const Utils = window.KasRT.Utils;
  const LS_SETTINGS_NAV = 'kasrt_settings_nav_collapsed';
  let isNavCollapsed = localStorage.getItem(LS_SETTINGS_NAV) === 'true';
  let showApiKeyPlain = false;

  const PRESET_AVATARS = [
    { id: 'av-1', label: 'Bapak Warga / Kemeja', url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='24' fill='%234f46e5'/%3E%3Ccircle cx='40' cy='32' r='14' fill='%23fed7aa'/%3E%3Cpath d='M28 26C28 20 52 20 52 26C52 29 48 30 40 30C32 30 28 29 28 26Z' fill='%231e293b'/%3E%3Cpath d='M20 66C20 50 28 46 40 46C52 46 60 50 60 66Z' fill='%231e1b4b'/%3E%3Cpath d='M35 46L40 56L45 46Z' fill='%23f59e0b'/%3E%3C/svg%3E" },
    { id: 'av-2', label: 'Ibu Warga / Hijab Modern', url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='24' fill='%23059669'/%3E%3Ccircle cx='40' cy='35' r='13' fill='%23fed7aa'/%3E%3Cpath d='M23 38C23 23 30 18 40 18C50 18 57 23 57 38C57 52 50 56 40 56C30 56 23 52 23 38Z' fill='%23047857'/%3E%3Ccircle cx='40' cy='36' r='10' fill='%23ffedd5'/%3E%3Cpath d='M20 68C20 54 28 50 40 50C52 50 60 54 60 68Z' fill='%23065f46'/%3E%3C/svg%3E" },
    { id: 'av-3', label: 'Pemuda Warga / Biru Kasual', url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='24' fill='%230284c7'/%3E%3Ccircle cx='40' cy='33' r='13' fill='%23fed7aa'/%3E%3Cpath d='M27 28C27 21 34 18 40 18C46 18 53 21 53 28C48 24 32 24 27 28Z' fill='%230f172a'/%3E%3Cpath d='M22 66C22 51 30 47 40 47C50 47 58 51 58 66Z' fill='%230369a1'/%3E%3C/svg%3E" },
    { id: 'av-4', label: 'Ibu Warga / Hangat Terang', url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='24' fill='%23ea580c'/%3E%3Ccircle cx='40' cy='22' r='7' fill='%237c2d12'/%3E%3Ccircle cx='40' cy='35' r='13' fill='%23fed7aa'/%3E%3Cpath d='M27 30C27 22 53 22 53 30C53 32 40 28 27 30Z' fill='%237c2d12'/%3E%3Cpath d='M20 68C20 53 28 49 40 49C52 49 60 53 60 68Z' fill='%23c2410c'/%3E%3C/svg%3E" },
    { id: 'av-5', label: 'Petugas / Rompi & Topi', url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='24' fill='%23d97706'/%3E%3Ccircle cx='40' cy='35' r='13' fill='%23fed7aa'/%3E%3Cpath d='M24 28C24 22 56 22 56 28H64L62 31H18L16 28H24Z' fill='%231e293b'/%3E%3Cpath d='M20 68C20 52 28 48 40 48C52 48 60 52 60 68Z' fill='%23b45309'/%3E%3Cpath d='M34 48H46V68H34Z' fill='%23fef08a'/%3E%3C/svg%3E" },
    { id: 'av-6', label: 'Warga Senior / Kacamata', url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='24' fill='%237c3aed'/%3E%3Ccircle cx='40' cy='34' r='13' fill='%23fed7aa'/%3E%3Cpath d='M28 25C30 19 50 19 52 25C46 22 34 22 28 25Z' fill='%2394a3b8'/%3E%3Ccircle cx='35' cy='34' r='4' stroke='%23334155' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='45' cy='34' r='4' stroke='%23334155' stroke-width='1.5' fill='none'/%3E%3Cline x1='39' y1='34' x2='41' y2='34' stroke='%23334155' stroke-width='1.5'/%3E%3Cpath d='M22 68C22 53 29 49 40 49C51 49 58 53 58 68Z' fill='%235b21b6'/%3E%3C/svg%3E" }
  ];
  window.KasRT = window.KasRT || {};
  window.KasRT.PRESET_AVATARS = PRESET_AVATARS;

  const SettingsPage = {
    PRESET_AVATARS,
    get isNavCollapsed() { return isNavCollapsed; },

    toggleNav() {
      isNavCollapsed = !isNavCollapsed;
      localStorage.setItem(LS_SETTINGS_NAV, String(isNavCollapsed));
      const navContainer = document.getElementById('settings-nav-container');
      const toggleBtn = document.getElementById('btn-toggle-settings-nav');
      const toggleIcon = document.getElementById('settings-toggle-icon');
      if (navContainer) {
        if (isNavCollapsed) {
          navContainer.classList.remove('lg:w-64');
          navContainer.classList.add('lg:w-20', 'settings-nav-collapsed');
        } else {
          navContainer.classList.remove('lg:w-20', 'settings-nav-collapsed');
          navContainer.classList.add('lg:w-64');
        }
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('title', isNavCollapsed ? 'Perluas Menu Pengaturan (Expand)' : 'Ciutkan Menu Pengaturan (Collapse)');
      }
      if (toggleIcon) {
        toggleIcon.textContent = isNavCollapsed ? 'last_page' : 'first_page';
      }
    },

    render(activeTab = null) {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const user = auth ? auth.user : null;
      const settings = (db && db.get('settings', 'global')) || {};
      const isAdmin = auth && auth.Permissions && auth.Permissions.isAdmin(user);
      const canManageSettings = isAdmin || (auth && auth.Permissions && auth.Permissions.has('manage_settings', user));

      // Tab default otomatis: Admin/Manager -> 'organisasi', Non-Admin -> 'profil'
      const requestedTab = activeTab || (canManageSettings ? 'organisasi' : 'profil');
      const adminOnlyTabs = ['organisasi', 'keuangan', 'kebijakan', 'kop', 'integrasi', 'integritas', 'bahaya'];
      let currentTab = requestedTab;
      let nonAdminNotice = '';

      if (adminOnlyTabs.includes(requestedTab) && !canManageSettings) {
        currentTab = 'profil';
        nonAdminNotice = `
          <div class="mb-5 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start sm:items-center gap-3 shadow-2xs">
            <span class="material-symbols-outlined text-amber-600 text-2xl flex-shrink-0">info</span>
            <div class="flex-1">
              <span class="font-bold">Informasi Akses:</span> Tab menu "${requestedTab}" memerlukan izin khusus Administrator atau Hak Kelola Pengaturan (manage_settings). Halaman Anda secara otomatis dialihkan ke menu <strong>Profil Saya</strong>.
            </div>
          </div>
        `;
      }

      isNavCollapsed = localStorage.getItem(LS_SETTINGS_NAV) === 'true';

      const tabs = [
        { id: 'profil', label: 'Profil Saya', icon: 'person' },
        ...(canManageSettings ? [
          { id: 'organisasi', label: 'Identitas Organisasi', icon: 'apartment' },
          { id: 'keuangan', label: 'Akun & Rekening Kas', icon: 'account_balance' },
          { id: 'kebijakan', label: 'Kebijakan Iuran', icon: 'policy' },
          { id: 'kop', label: 'Editor KOP & Cetak', icon: 'print' },
          { id: 'integrasi', label: 'Sistem / Integrasi', icon: 'hub' },
          { id: 'integritas', label: 'Integritas Data', icon: 'verified' },
          { id: 'bahaya', label: 'Zona Bahaya & Reset', icon: 'warning' }
        ] : []),
        { id: 'tampilan', label: 'Tampilan & Tema Gradien', icon: 'palette' },
        { id: 'notifikasi', label: 'Notifikasi', icon: 'notifications' }
      ];

      return `
        <div class="space-y-4 max-w-full">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-xl sm:text-2xl font-black font-display text-on-surface">Pengaturan Sistem & Akun</h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Konfigurasi organisasi, kredensial integrasi database cloud, tema gradien, dan profil pribadi</p>
            </div>
            ${isAdmin ? `
              <div class="flex items-center gap-2 self-start sm:self-auto">
                <span class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Otoritas Administrator</span>
                </span>
              </div>
            ` : `
              <div class="flex items-center gap-2 self-start sm:self-auto">
                <span class="px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base">verified_user</span>
                  <span>Edit Profil Mandiri</span>
                </span>
              </div>
            `}
          </div>

          ${nonAdminNotice}

          <!-- SUBMENU PENGATURAN MENDATAR (HORIZONTAL TABS) DENGAN SCROLLBAR KANAN-KIRI -->
          <div class="w-full bg-surface-lowest rounded-2xl border border-outline-variant p-2 sm:p-2.5 shadow-2xs">
            <div id="settings-tabs-scroll-container" class="w-full flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 px-1 kasrt-tab-scroll">
              ${tabs.map(t => {
                const isActive = currentTab === t.id;
                const isSpecialIntegrasi = t.id === 'integrasi';
                return `
                  <a href="#/app/settings?tab=${t.id}"
                     title="${t.label}"
                     class="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                       isActive
                         ? 'bg-theme-gradient text-white shadow-sm ring-1 ring-white/20'
                         : (isSpecialIntegrasi
                             ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/60'
                             : 'text-slate-600 dark:text-slate-300 hover:text-on-surface hover:bg-surface-container border border-transparent')
                     }">
                    <span class="material-symbols-outlined text-xl flex-shrink-0 ${isSpecialIntegrasi && !isActive ? 'text-primary' : ''}">${t.icon}</span>
                    <span>${t.label}</span>
                    ${isSpecialIntegrasi && !isActive ? `
                      <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    ` : ''}
                  </a>
                `;
              }).join('')}
            </div>
          </div>

          <!-- AREA KERJA UTAMA LEBIH LUAS (FULL WIDTH) -->
          <div id="settings-content-container" class="w-full min-w-0 bg-surface-lowest rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-xs">
            ${this.renderTabContent(currentTab, user, settings, isAdmin)}
          </div>
        </div>
      `;
    },

    renderTabContent(tab, user, settings, isAdmin) {
      if (tab === 'profil') return this.renderProfileTab(user);
      if (tab === 'organisasi') return this.renderOrganizationTab(settings);
      if (tab === 'keuangan') return this.renderFinanceTab();
      if (tab === 'kebijakan') return this.renderPolicyTab(settings);
      if (tab === 'kop') return this.renderKopTab();
      if (tab === 'integrasi') return this.renderIntegrasiTab(settings, user, isAdmin);
      if (tab === 'tampilan') return this.renderThemeTab(settings);
      if (tab === 'notifikasi') return this.renderNotificationTab();
      if (tab === 'integritas') return this.renderIntegrityTab();
      if (tab === 'bahaya') return this.renderDangerTab();
      return `<div class="text-xs text-slate-400">Pilih menu pengaturan di sebelah kiri.</div>`;
    },

    renderIntegrasiTab(settings, user, isAdmin) {
      if (!isAdmin) {
        return `
          <div class="p-8 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-3xl text-rose-700 dark:text-rose-300">
            <span class="material-symbols-outlined text-4xl mb-2 text-rose-600">lock</span>
            <h3 class="font-bold text-base">Akses Ditolak (403 Forbidden)</h3>
            <p class="text-xs mt-1">Tab Sistem / Integrasi Kredensial Firebase memiliki proteksi keamanan tingkat tinggi dan hanya dapat diakses oleh Administrator Sistem.</p>
          </div>
        `;
      }

      const fb = window.KasRT.FirebaseConfig;
      const diag = fb ? fb.getFirebaseDiagnostics() : { enabled: false, diagnostics: { isValid: false, issues: [] } };
      const rawCfg = fb ? fb.getRawConfig() : {};
      const isConnected = diag.enabled;
      const hasCustom = diag.hasCustomConfig;

      const db = window.KasRT.DB;
      const allAuditLogs = (db && db.list('auditLogs')) || [];
      const credAuditLogs = allAuditLogs.filter(l => 
        l.collection === 'settings_firebase' ||
        l.aksi === 'UPDATE_FIREBASE_CREDENTIALS' ||
        l.aksi === 'RESET_FIREBASE_CREDENTIALS' ||
        l.aksi === 'TEST_FIREBASE_CONNECTION' ||
        l.aksi === 'UNAUTHORIZED_SETTINGS_ACCESS_ATTEMPT'
      ).slice(0, 10);

      const monitor = window.KasRT.DBMonitor;
      const mState = monitor ? monitor.getState() : { latencyMs: 12, status: 'ONLINE' };

      return `
        <div class="space-y-6 text-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Tab Khusus Sistem / Integrasi
                </span>
                <span class="text-slate-400 font-mono text-[11px]">Enkripsi Aman & Audit Trail</span>
              </div>
              <h3 class="font-extrabold text-base text-on-surface font-display flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-xl">hub</span>
                <span>Pengaturan Kredensial Firebase & Koneksi Database</span>
              </h3>
              <p class="text-slate-500 text-[11px] mt-0.5">
                Konfigurasikan integrasi Google Firebase Firestore & Authentication untuk sinkronisasi database serverless multi-perangkat.
              </p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <button type="button" onclick="KasRT.Pages.Settings.openPasteJsonModal()" class="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container/60 hover:bg-surface-container font-bold text-xs flex items-center gap-1.5 transition-colors text-on-surface cursor-pointer">
                <span class="material-symbols-outlined text-base text-primary">content_paste</span>
                <span>Tempel JSON Config</span>
              </button>
              <button type="button" onclick="KasRT.Pages.Settings.handleTestFirebaseConnection()" id="btn-test-fb-conn" class="px-3.5 py-1.5 rounded-xl bg-surface-lowest border border-outline-variant hover:bg-surface-container font-bold text-xs flex items-center gap-1.5 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer">
                <span class="material-symbols-outlined text-base text-emerald-600">network_check</span>
                <span>Uji Koneksi (Ping)</span>
              </button>
            </div>
          </div>

          <div class="p-4 sm:p-5 rounded-2xl border transition-all ${
            isConnected
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : (hasCustom
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200')
          }">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold shadow-xs ${
                  isConnected ? 'bg-emerald-600' : (hasCustom ? 'bg-amber-600' : 'bg-indigo-600')
                }">
                  <span class="material-symbols-outlined text-2xl">${isConnected ? 'cloud_done' : (hasCustom ? 'cloud_sync' : 'cloud_off')}</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-sm sm:text-base font-display">
                      ${isConnected ? 'Terhubung Aktif ke Google Firebase Firestore' : (hasCustom ? 'Kredensial Tersimpan (Uji Koneksi Diperlukan)' : 'Mode Lokal / Demo (Kredensial Belum Terpasang)')}
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isConnected ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                    }">
                      ${isConnected ? 'ONLINE CLOUD' : 'OFFLINE-FIRST'}
                    </span>
                  </div>
                  <p class="text-[11px] opacity-80 mt-0.5 leading-relaxed">
                    ${isConnected 
                      ? `Project ID: <strong class="font-mono font-bold">${rawCfg.projectId}</strong> | Database Firestore sinkron otomatis | Latensi ping: <strong>${mState.latencyMs} ms</strong>` 
                      : 'Data saat ini tersimpan aman di LocalStorage browser perangkat Anda. Masukkan kredensial Firebase di bawah untuk mengaktifkan sinkronisasi cloud.'}
                  </p>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="text-[10px] uppercase font-bold opacity-70 block">Konteks Keamanan:</span>
                <span class="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ${diag.diagnostics.isHttps ? '✓ HTTPS Terverifikasi' : '⚠ Non-HTTPS (Waspada)'}
                </span>
              </div>
            </div>
          </div>

          <div class="bg-surface-lowest rounded-3xl border border-outline-variant p-5 sm:p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant/60">
              <div>
                <h4 class="font-bold text-sm text-on-surface font-display flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-lg">vpn_key</span>
                  <span>Parameter Kredensial Firebase Web App</span>
                </h4>
                <p class="text-[11px] text-slate-500">Dapatkan konfigurasi ini dari Google Firebase Console (Project Settings -> General -> Your apps -> Web app)</p>
              </div>
              <button type="button" onclick="KasRT.Pages.Settings.toggleApiKeyVisibility()" class="px-2.5 py-1 rounded-xl border border-outline-variant text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-surface-container flex items-center gap-1 transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-sm">${showApiKeyPlain ? 'visibility_off' : 'visibility'}</span>
                <span>${showApiKeyPlain ? 'Sembunyikan API Key' : 'Tampilkan API Key'}</span>
              </button>
            </div>

            <form id="form-firebase-credentials" onsubmit="KasRT.Pages.Settings.handleSaveFirebaseConfig(event)" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Web API Key (apiKey) <span class="text-rose-500">*</span>
                  </label>
                  <div class="relative">
                    <input 
                      type="${showApiKeyPlain ? 'text' : 'password'}" 
                      id="fb-input-apiKey" 
                      required 
                      value="${rawCfg.apiKey || ''}" 
                      placeholder="AIzaSy..." 
                      class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-outline-variant bg-surface-lowest font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none" 
                    />
                    <button type="button" onclick="KasRT.Pages.Settings.toggleApiKeyVisibility()" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <span class="material-symbols-outlined text-base">${showApiKeyPlain ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <span class="text-[10px] text-slate-400 mt-0.5 block">Kunci otentikasi publik Google API (AIzaSy...)</span>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Project ID (projectId) <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="fb-input-projectId" 
                    required 
                    value="${rawCfg.projectId || ''}" 
                    placeholder="kasrt-app-production" 
                    class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none font-bold text-primary" 
                  />
                  <span class="text-[10px] text-slate-400 mt-0.5 block">ID unik proyek Google Firebase</span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Auth Domain (authDomain) <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="fb-input-authDomain" 
                    required 
                    value="${rawCfg.authDomain || ''}" 
                    placeholder="kasrt-app.firebaseapp.com" 
                    class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none" 
                  />
                  <span class="text-[10px] text-slate-400 mt-0.5 block">Domain callback OAuth login</span>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    App ID (appId) <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="fb-input-appId" 
                    required 
                    value="${rawCfg.appId || ''}" 
                    placeholder="1:123456789012:web:abcdef123456" 
                    class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none" 
                  />
                  <span class="text-[10px] text-slate-400 mt-0.5 block">Pengenal unik aplikasi Web Client</span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Storage Bucket (storageBucket)
                  </label>
                  <input 
                    type="text" 
                    id="fb-input-storageBucket" 
                    value="${rawCfg.storageBucket || ''}" 
                    placeholder="kasrt-app.appspot.com" 
                    class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none" 
                  />
                  <span class="text-[10px] text-slate-400 mt-0.5 block">Bucket penyimpanan file bukti transfer (opsional)</span>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Messaging Sender ID (messagingSenderId)
                  </label>
                  <input 
                    type="text" 
                    id="fb-input-messagingSenderId" 
                    value="${rawCfg.messagingSenderId || ''}" 
                    placeholder="123456789012" 
                    class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none" 
                  />
                  <span class="text-[10px] text-slate-400 mt-0.5 block">Nomor unik pengirim notifikasi FCM (opsional)</span>
                </div>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Firestore Database URL (Opsional)
                </label>
                <input 
                  type="text" 
                  id="fb-input-databaseURL" 
                  value="${rawCfg.databaseURL || ''}" 
                  placeholder="https://kasrt-app-default-rtdb.asia-southeast1.firebasedatabase.app" 
                  class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none" 
                />
                <span class="text-[10px] text-slate-400 mt-0.5 block">Biarkan kosong jika menggunakan default Firestore</span>
              </div>

              <div class="pt-4 border-t border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <button 
                    type="button" 
                    onclick="KasRT.Pages.Settings.handleResetFirebaseConfig()" 
                    class="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Hapus kredensial custom dan kembali ke mode offline lokal default"
                  >
                    <span class="material-symbols-outlined text-base">restart_alt</span>
                    <span>Kembalikan ke Mode Demo Offline</span>
                  </button>
                </div>

                <div class="flex items-center gap-2.5">
                  <button 
                    type="submit" 
                    id="btn-save-fb-config"
                    class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span class="material-symbols-outlined text-base">save</span>
                    <span>Simpan & Terapkan Kredensial Firebase</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div class="bg-surface-lowest rounded-3xl border border-outline-variant p-5 sm:p-6 shadow-xs space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/60">
              <div>
                <h4 class="font-bold text-sm text-on-surface font-display flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-500 text-lg">security</span>
                  <span>Log Aktivitas & Audit Keamanan Kredensial Firebase</span>
                </h4>
                <p class="text-[11px] text-slate-500">Mencatat setiap kali kredensial diubah, diuji, atau di-reset untuk keperluan audit kepatuhan & transparansi</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-surface-container text-slate-500">
                ${credAuditLogs.length} Entri Audit Terkini
              </span>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-outline-variant">
              <table class="w-full text-xs text-left min-w-[620px]">
                <thead class="bg-surface-container/60 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant tracking-wider">
                  <tr>
                    <th class="py-2.5 px-3">Waktu</th>
                    <th class="py-2.5 px-3">Administrator</th>
                    <th class="py-2.5 px-3">Tindakan / Aksi</th>
                    <th class="py-2.5 px-3">Target Entitas</th>
                    <th class="py-2.5 px-3">Catatan / Masked Key</th>
                    <th class="py-2.5 px-3 text-center">Detail</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/40 font-mono">
                  ${credAuditLogs.length === 0 ? `
                    <tr><td colspan="6" class="py-8 text-center text-slate-400 italic">Belum ada riwayat perubahan kredensial yang tercatat.</td></tr>
                  ` : credAuditLogs.map(l => {
                    const isAlert = l.aksi.includes('RESET') || l.aksi.includes('UNAUTHORIZED');
                    return `
                      <tr class="hover:bg-surface-container/30 transition-colors">
                        <td class="py-2.5 px-3 text-slate-500 whitespace-nowrap">${Utils.formatDateTime(l.timestamp)}</td>
                        <td class="py-2.5 px-3 font-sans font-bold text-on-surface whitespace-nowrap">${l.userName || 'Admin'}</td>
                        <td class="py-2.5 px-3 whitespace-nowrap">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAlert 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }">
                            ${l.aksi}
                          </span>
                        </td>
                        <td class="py-2.5 px-3 text-slate-600 dark:text-slate-300">${l.recordId || l.collection}</td>
                        <td class="py-2.5 px-3 text-[11px] text-slate-500 truncate max-w-xs">
                          ${l.dataBaru?.apiKey ? `Key: ${l.dataBaru.apiKey}` : (l.dataBaru?.status || l.dataBaru?.reason || 'Perubahan tersimpan')}
                        </td>
                        <td class="py-2.5 px-3 text-center">
                          <button onclick="KasRT.Pages.Audit.showDetail('${l.id}')" class="px-2 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-white font-sans text-[10px] font-bold transition-colors cursor-pointer">
                            Inspeksi
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Seluruh log audit bersifat immutable dan disimpan secara berurutan.</span>
              <a href="#/app/audit" class="text-primary font-bold hover:underline">Buka Log Audit Penuh →</a>
            </div>
          </div>
        </div>
      `;
    },

    toggleApiKeyVisibility() {
      showApiKeyPlain = !showApiKeyPlain;
      const input = document.getElementById('fb-input-apiKey');
      if (input) {
        input.type = showApiKeyPlain ? 'text' : 'password';
      }
    },

    openPasteJsonModal() {
      const html = `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-xl">integration_instructions</span>
              </div>
              <div>
                <h3 class="font-extrabold text-base text-on-surface font-display">Tempel Konfigurasi JSON Firebase</h3>
                <p class="text-xs text-slate-500">Salin langsung blok objek firebaseConfig dari konsol Firebase</p>
              </div>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div class="space-y-4 text-xs">
            <p class="text-slate-500 leading-relaxed">
              Format yang didukung: JSON murni <code>{"apiKey": "..."}</code> atau cuplikan JavaScript <code>const firebaseConfig = { apiKey: "..." };</code>
            </p>
            <textarea id="paste-fb-json-input" rows="8" placeholder='const firebaseConfig = {&#10;  apiKey: "AIzaSy...",&#10;  authDomain: "kasrt.firebaseapp.com",&#10;  projectId: "kasrt",&#10;  storageBucket: "kasrt.appspot.com",&#10;  messagingSenderId: "123456789",&#10;  appId: "1:123456:web:abcdef"&#10;};' class="w-full p-3 rounded-2xl border border-outline-variant bg-surface-lowest font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
            <div class="pt-3 border-t border-outline-variant flex items-center justify-end gap-2.5">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 rounded-xl border border-outline-variant text-slate-600 font-bold cursor-pointer">
                Batal
              </button>
              <button type="button" onclick="KasRT.Pages.Settings.handleApplyPastedJson()" class="px-5 py-2 rounded-xl bg-theme-gradient text-white font-bold shadow-md hover:opacity-90 cursor-pointer">
                Ekstrak & Terapkan ke Form
              </button>
            </div>
          </div>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'lg' });
    },

    handleApplyPastedJson() {
      const raw = document.getElementById('paste-fb-json-input')?.value || '';
      if (!raw.trim()) {
        window.KasRT.UI.showToast('Teks konfigurasi tidak boleh kosong.', 'warning');
        return;
      }
      try {
        let clean = raw.trim();
        clean = clean.replace(/^(const|var|let)\s+[a-zA-Z0-9_]+\s*=\s*/, '');
        clean = clean.replace(/;\s*$/, '');
        let parsed = null;
        try {
          parsed = JSON.parse(clean);
        } catch (e) {
          const extractField = (name) => {
            const match = clean.match(new RegExp(`['"]?${name}['"]?\\s*:\\s*['"]([^'"]+)['"]`));
            return match ? match[1] : '';
          };
          parsed = {
            apiKey: extractField('apiKey'),
            authDomain: extractField('authDomain'),
            projectId: extractField('projectId'),
            storageBucket: extractField('storageBucket'),
            messagingSenderId: extractField('messagingSenderId'),
            appId: extractField('appId'),
            databaseURL: extractField('databaseURL')
          };
        }

        if (!parsed || !parsed.apiKey || !parsed.projectId) {
          throw new Error('Tidak dapat menemukan "apiKey" atau "projectId" yang valid di dalam teks yang ditempel.');
        }

        if (document.getElementById('fb-input-apiKey')) document.getElementById('fb-input-apiKey').value = parsed.apiKey || '';
        if (document.getElementById('fb-input-authDomain')) document.getElementById('fb-input-authDomain').value = parsed.authDomain || '';
        if (document.getElementById('fb-input-projectId')) document.getElementById('fb-input-projectId').value = parsed.projectId || '';
        if (document.getElementById('fb-input-storageBucket')) document.getElementById('fb-input-storageBucket').value = parsed.storageBucket || '';
        if (document.getElementById('fb-input-messagingSenderId')) document.getElementById('fb-input-messagingSenderId').value = parsed.messagingSenderId || '';
        if (document.getElementById('fb-input-appId')) document.getElementById('fb-input-appId').value = parsed.appId || '';
        if (document.getElementById('fb-input-databaseURL')) document.getElementById('fb-input-databaseURL').value = parsed.databaseURL || '';

        window.KasRT.UI.closeModal();
        window.KasRT.UI.showToast(`Konfigurasi Project "${parsed.projectId}" berhasil diekstrak! Klik "Simpan & Terapkan" untuk menyimpan.`, 'success');
      } catch (err) {
        window.KasRT.UI.showToast('Gagal memproses JSON: ' + err.message, 'error');
      }
    },

    async handleTestFirebaseConnection() {
      const btn = document.getElementById('btn-test-fb-conn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined text-base animate-spin">refresh</span><span>Menguji Ping...</span>`;
      }
      const tempCfg = {
        apiKey: document.getElementById('fb-input-apiKey')?.value || '',
        authDomain: document.getElementById('fb-input-authDomain')?.value || '',
        projectId: document.getElementById('fb-input-projectId')?.value || '',
        storageBucket: document.getElementById('fb-input-storageBucket')?.value || '',
        messagingSenderId: document.getElementById('fb-input-messagingSenderId')?.value || '',
        appId: document.getElementById('fb-input-appId')?.value || '',
        databaseURL: document.getElementById('fb-input-databaseURL')?.value || ''
      };
      try {
        const result = await window.KasRT.FirebaseConfig.testConnection(tempCfg);
        const auth = window.KasRT.Auth;
        const db = window.KasRT.DB;
        if (db) {
          await db.log(
            auth?.user?.id || 'admin',
            'TEST_FIREBASE_CONNECTION',
            'settings_firebase',
            tempCfg.projectId || 'test',
            null,
            {
              success: result.success,
              latencyMs: result.latencyMs,
              message: result.message || result.error
            }
          );
        }
        if (result.success) {
          window.KasRT.UI.showToast(`Koneksi Berhasil! Ping Firestore: ${result.latencyMs} ms ke project "${result.projectId}".`, 'success', 5000);
        } else {
          window.KasRT.UI.showToast(`Koneksi Gagal: ${result.error}`, 'error', 6000);
        }
      } catch (err) {
        window.KasRT.UI.showToast('Gagal menjalankan uji koneksi: ' + err.message, 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span class="material-symbols-outlined text-base text-emerald-600">network_check</span><span>Uji Koneksi (Ping)</span>`;
        }
      }
    },

    async handleSaveFirebaseConfig(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-save-fb-config');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined text-base animate-spin">sync</span><span>Menyimpan Kredensial...</span>`;
      }
      const newCfg = {
        apiKey: document.getElementById('fb-input-apiKey')?.value,
        authDomain: document.getElementById('fb-input-authDomain')?.value,
        projectId: document.getElementById('fb-input-projectId')?.value,
        storageBucket: document.getElementById('fb-input-storageBucket')?.value,
        messagingSenderId: document.getElementById('fb-input-messagingSenderId')?.value,
        appId: document.getElementById('fb-input-appId')?.value,
        databaseURL: document.getElementById('fb-input-databaseURL')?.value
      };
      try {
        const auth = window.KasRT.Auth;
        const res = await window.KasRT.FirebaseConfig.saveConfig(newCfg, auth?.user);
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Kredensial Firebase Project "${res.projectId}" berhasil disimpan dan dicatat ke log audit!`, 'success', 4500);
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(err.message, 'error');
        }
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span class="material-symbols-outlined text-base">save</span><span>Simpan & Terapkan Kredensial Firebase</span>`;
        }
      }
    },

    async handleResetFirebaseConfig() {
      const confirm = await window.KasRT.UI.confirmModal({
        title: 'Kembalikan ke Mode Demo Offline',
        message: 'Apakah Anda yakin ingin menghapus kredensial kustom Firebase dan kembali ke penyimpanan lokal offline (mode demo)? Tindakan ini akan dicatat ke log audit keamanan.',
        danger: true
      });
      if (confirm) {
        try {
          const auth = window.KasRT.Auth;
          await window.KasRT.FirebaseConfig.resetConfig(auth?.user);
          if (window.KasRT.UI) {
            window.KasRT.UI.showToast('Kredensial Firebase dihapus. Sistem beroperasi dalam Mode Demo Offline.', 'info');
          }
          window.KasRT.Events.handleRouting();
        } catch (err) {
          if (window.KasRT.UI) {
            window.KasRT.UI.showToast(err.message, 'error');
          }
        }
      }
    },

    renderProfileTab(user) {
      const db = window.KasRT && window.KasRT.DB;
      const resident = user?.residentId ? db?.get('residents', user.residentId) : null;
      const alamatDefault = resident?.alamat || user?.alamat || '';
      const currentAvatar = user?.avatarUrl || '';
      const namaUser = user?.nama || 'Pengguna';
      const userInitials = (window.KasRT?.Utils?.initials ? window.KasRT.Utils.initials(namaUser) : namaUser.charAt(0) || 'U').toUpperCase();

      return `
        <div class="space-y-6 text-sm max-w-4xl">
          <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div class="flex items-center gap-4">
              <div id="prof-header-avatar-box" class="relative shrink-0">
                ${currentAvatar ? `
                  <img id="prof-header-avatar-img" src="${currentAvatar}" alt="${namaUser}" class="w-20 h-20 rounded-3xl object-cover shadow-md border-2 border-primary/30" onerror="this.style.display='none'; document.getElementById('prof-header-initials-fallback').style.display='flex';" />
                  <div id="prof-header-initials-fallback" class="w-20 h-20 rounded-3xl bg-theme-gradient text-white font-black text-2xl items-center justify-center shadow-md hidden">
                    ${userInitials}
                  </div>
                ` : `
                  <div id="prof-header-initials-fallback" class="w-20 h-20 rounded-3xl bg-theme-gradient text-white font-black text-2xl flex items-center justify-center shadow-md">
                    ${userInitials}
                  </div>
                `}
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 id="prof-display-name" class="font-extrabold text-lg sm:text-xl text-on-surface font-display">${namaUser}</h3>
                  <div class="flex flex-wrap gap-1.5 items-center">
                    ${(user?.roles || []).map(r => {
                      const rMeta = (window.KasRT?.Auth?.Permissions?.roleById(r)) || null;
                      const rName = rMeta ? rMeta.name : r;
                      const rColor = rMeta ? (rMeta.color || '#4f46e5') : '#4f46e5';
                      const rIcon = rMeta ? (rMeta.icon || 'badge') : 'badge';
                      return `
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs" style="background-color: ${rColor}1a; color: ${rColor}; border: 1px solid ${rColor}40">
                          <span class="material-symbols-outlined text-[13px]">${rIcon}</span>
                          <span>${rName}</span>
                        </span>
                      `;
                    }).join('') || '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">Warga</span>'}
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Akun Aktif
                  </span>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>@${user?.username || 'user'}</span>
                  <span>•</span>
                  <span>${user?.email || 'user@kasrt.id'}</span>
                </div>
                <p class="text-xs text-slate-400">Seluruh pengguna (semua role) berhak mengubah foto dan data profil mandiri secara fleksibel.</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button type="button" onclick="document.getElementById('prof-avatar-file').click()" class="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-slate-200 dark:hover:bg-slate-700 text-on-surface text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-base text-primary">add_a_photo</span>
                <span>Ganti Foto</span>
              </button>
            </div>
          </div>

          <form onsubmit="KasRT.Pages.Settings.handleSaveProfile(event)" class="space-y-6">
            <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div>
                  <h4 class="font-extrabold text-base text-on-surface font-display flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-xl">account_circle</span>
                    <span>Foto Profil & Avatar Pribadi</span>
                  </h4>
                  <p class="text-xs text-slate-500 mt-0.5">Unggah foto pribadi dari galeri perangkat atau pilih salah satu ilustrasi avatar modern di bawah</p>
                </div>
                <div id="prof-avatar-status-badge">
                  ${currentAvatar ? `
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Foto Kustom Aktif</span>
                  ` : `
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Avatar Inisial Bawaan</span>
                  `}
                </div>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <div class="relative w-24 h-24 shrink-0">
                  <div id="prof-avatar-preview-box" class="w-24 h-24 rounded-3xl overflow-hidden border-2 border-outline-variant bg-surface-container flex items-center justify-center shadow-inner">
                    ${currentAvatar ? `
                      <img id="prof-avatar-preview-img" src="${currentAvatar}" alt="Preview Foto" class="w-full h-full object-cover" onerror="this.style.display='none'; document.getElementById('prof-avatar-preview-initials').style.display='flex';" />
                      <div id="prof-avatar-preview-initials" class="w-full h-full bg-theme-gradient text-white font-black text-2xl items-center justify-center hidden">
                        ${userInitials}
                      </div>
                    ` : `
                      <div id="prof-avatar-preview-initials" class="w-full h-full bg-theme-gradient text-white font-black text-2xl flex items-center justify-center">
                        ${userInitials}
                      </div>
                    `}
                  </div>
                </div>
                <div class="space-y-2 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <input type="file" id="prof-avatar-file" accept="image/*" class="hidden" onchange="KasRT.Pages.Settings.handleAvatarFileChange(event)" />
                    <button type="button" onclick="document.getElementById('prof-avatar-file').click()" class="px-4 py-2.5 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-sm hover:opacity-90 flex items-center gap-1.5 cursor-pointer">
                      <span class="material-symbols-outlined text-base">upload_file</span>
                      <span>Unggah Foto dari Perangkat</span>
                    </button>
                    <button type="button" onclick="KasRT.Pages.Settings.removeProfileAvatar()" class="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                      <span class="material-symbols-outlined text-base">delete</span>
                      <span>Hapus Foto (Gunakan Inisial)</span>
                    </button>
                  </div>
                  <p class="text-[11px] text-slate-400">Mendukung format PNG, JPG, JPEG, GIF, atau WebP. Gambar akan dioptimasi otomatis secara instan.</p>
                </div>
              </div>

              <div class="pt-3 border-t border-outline-variant/60">
                <span class="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">Pilih Cepat dari Koleksi Avatar Warga:</span>
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  ${PRESET_AVATARS.map((av, idx) => `
                    <button type="button" onclick="KasRT.Pages.Settings.selectPresetAvatarByIndex(${idx})" title="${av.label}" class="p-2 rounded-2xl border border-outline-variant hover:border-primary hover:scale-105 transition-all flex flex-col items-center gap-1.5 bg-surface-lowest group cursor-pointer">
                      <img src="${av.url}" alt="${av.label}" class="w-12 h-12 rounded-xl object-contain drop-shadow-xs" />
                      <span class="text-[10px] font-semibold text-slate-500 group-hover:text-primary truncate max-w-full text-center">${av.label.split(' / ')[0]}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="pt-2">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Atau Masukkan Tautan / Data URL Gambar Avatar:</label>
                <div class="relative">
                  <input type="text" id="prof-avatar" value="${currentAvatar}" placeholder="https://domain.com/foto.jpg atau data:image/..." oninput="KasRT.Pages.Settings.updateProfileAvatarPreview(this.value)" class="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <span class="material-symbols-outlined text-slate-400 text-sm absolute left-3 top-2.5">link</span>
                </div>
              </div>
            </div>

            <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-xs space-y-4">
              <h4 class="font-extrabold text-base text-on-surface font-display flex items-center gap-2 pb-3 border-b border-outline-variant">
                <span class="material-symbols-outlined text-primary text-xl">badge</span>
                <span>Informasi Akun & Data Pribadi</span>
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-on-surface mb-1.5">
                    Nama Lengkap <span class="text-rose-500">*</span>
                  </label>
                  <input type="text" id="prof-nama" value="${namaUser}" required placeholder="Nama lengkap Anda" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-sm font-bold text-on-surface mb-1.5">
                    Nomor WhatsApp / HP Aktif
                  </label>
                  <input type="tel" id="prof-phone" value="${user?.noHp || resident?.noHp || ''}" placeholder="081234567890" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-on-surface mb-1.5 flex items-center justify-between">
                    <span>Username Login</span>
                    <span class="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                      <span class="material-symbols-outlined text-xs">lock</span> Terkunci (Read-Only)
                    </span>
                  </label>
                  <input type="text" value="@${user?.username || ''}" disabled class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container opacity-75 text-sm font-mono cursor-not-allowed text-slate-500" />
                  <span class="text-[11px] text-slate-400 mt-1 block">Username akun tidak dapat diubah secara bebas demi integritas sistem login.</span>
                </div>
                <div>
                  <label class="block text-sm font-bold text-on-surface mb-1.5 flex items-center justify-between">
                    <span>Email Akun (Login)</span>
                    <span class="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                      <span class="material-symbols-outlined text-xs">lock</span> Terkunci (Read-Only)
                    </span>
                  </label>
                  <input type="email" value="${user?.email || ''}" disabled class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container opacity-75 text-sm font-mono cursor-not-allowed text-slate-500" />
                  <span class="text-[11px] text-slate-400 mt-1 block">Email akun dikunci untuk menjaga konsistensi autentikasi pengguna.</span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-on-surface mb-1.5">Alamat Rumah / Blok / No. Rumah</label>
                  <input type="text" id="prof-alamat" value="${alamatDefault}" placeholder="Contoh: Blok B4 No. 12 RT 01" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-sm font-bold text-on-surface mb-1.5">Jabatan / Panggilan di Lingkungan</label>
                  <input type="text" id="prof-jabatan" value="${user?.jabatan || 'Warga RT'}" placeholder="Contoh: Warga RT / Sie Keamanan" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-on-surface mb-1.5">Catatan / Bio Singkat</label>
                <textarea id="prof-bio" rows="2" placeholder="Catatan singkat mengenai Anda, kontak darurat, atau keterangan peran..." class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">${user?.bio || ''}</textarea>
              </div>
            </div>

            <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-xs space-y-3.5">
              <div class="flex items-center gap-2.5 pb-2 border-b border-outline-variant">
                <span class="material-symbols-outlined text-primary text-2xl">key</span>
                <div>
                  <h4 class="font-bold text-base text-on-surface font-display">Ganti Kata Sandi (Password Akun)</h4>
                  <p class="text-xs text-slate-500">Kosongkan kolom kata sandi jika Anda tidak ingin mengubah kata sandi akun saat ini.</p>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kata Sandi Baru</label>
                  <input type="password" id="prof-new-pass" placeholder="Minimal 4 karakter" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ulangi Kata Sandi Baru</label>
                  <input type="password" id="prof-confirm-pass" placeholder="Ketik ulang kata sandi baru" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
            </div>

            <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <span class="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                <span>Perubahan foto profil dan biodata langsung berlaku seketika di seluruh halaman sistem</span>
              </div>
              <button type="submit" id="btn-save-profile" class="px-8 py-3 rounded-2xl bg-theme-gradient text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-xl">save</span>
                <span>Simpan Perubahan Profil Saya</span>
              </button>
            </div>
          </form>
        </div>
      `;
    },

    handleAvatarFileChange(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Harap pilih file gambar (JPG, PNG, GIF, WebP).', 'error');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Ukuran file foto maksimal 8 MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          const avatarInput = document.getElementById('prof-avatar');
          if (avatarInput) avatarInput.value = dataUrl;
          SettingsPage.updateProfileAvatarPreview(dataUrl);
          if (window.KasRT.UI) window.KasRT.UI.showToast('Foto berhasil dimuat ke preview! Klik "Simpan Perubahan Profil Saya" untuk menyimpan.', 'success');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    selectPresetAvatarByIndex(idx) {
      const list = this.PRESET_AVATARS || window.KasRT?.PRESET_AVATARS || (typeof PRESET_AVATARS !== 'undefined' ? PRESET_AVATARS : []);
      const av = list && list[idx];
      if (av && av.url) {
        this.selectPresetAvatar(av.url);
      }
    },

    selectPresetAvatar(url) {
      const avatarInput = document.getElementById('prof-avatar');
      if (avatarInput) avatarInput.value = url;
      this.updateProfileAvatarPreview(url);
      if (window.KasRT.UI) window.KasRT.UI.showToast('Preset avatar dipilih! Klik "Simpan Perubahan Profil Saya" untuk mengonfirmasi.', 'info');
    },

    removeProfileAvatar() {
      const avatarInput = document.getElementById('prof-avatar');
      if (avatarInput) avatarInput.value = '';
      this.updateProfileAvatarPreview('');
      if (window.KasRT.UI) window.KasRT.UI.showToast('Foto profil dibersihkan. Sistem akan menggunakan avatar inisial.', 'info');
    },

    updateProfileAvatarPreview(url) {
      const previewBox = document.getElementById('prof-avatar-preview-box');
      const headerBox = document.getElementById('prof-header-avatar-box');
      const user = window.KasRT.Auth?.user;
      const initials = (window.KasRT?.Utils?.initials ? window.KasRT.Utils.initials(user?.nama || 'Pengguna') : 'U').toUpperCase();

      if (url && url.trim()) {
        if (previewBox) {
          previewBox.innerHTML = `
            <img id="prof-avatar-preview-img" src="${url}" alt="Preview Foto" class="w-full h-full object-cover" onerror="this.style.display='none'; document.getElementById('prof-avatar-preview-initials').style.display='flex';" />
            <div id="prof-avatar-preview-initials" class="w-full h-full bg-theme-gradient text-white font-black text-2xl items-center justify-center hidden">${initials}</div>
          `;
        }
        if (headerBox) {
          headerBox.innerHTML = `
            <img id="prof-header-avatar-img" src="${url}" alt="${user?.nama || 'Profil'}" class="w-20 h-20 rounded-3xl object-cover shadow-md border-2 border-primary/30" onerror="this.style.display='none'; document.getElementById('prof-header-initials-fallback').style.display='flex';" />
            <div id="prof-header-initials-fallback" class="w-20 h-20 rounded-3xl bg-theme-gradient text-white font-black text-2xl flex items-center justify-center shadow-md hidden">${initials}</div>
          `;
        }
      } else {
        if (previewBox) {
          previewBox.innerHTML = `
            <div id="prof-avatar-preview-initials" class="w-full h-full bg-theme-gradient text-white font-black text-2xl flex items-center justify-center">${initials}</div>
          `;
        }
        if (headerBox) {
          headerBox.innerHTML = `
            <div id="prof-header-initials-fallback" class="w-20 h-20 rounded-3xl bg-theme-gradient text-white font-black text-2xl flex items-center justify-center shadow-md">${initials}</div>
          `;
        }
      }
    },

    async handleSaveProfile(e) {
      e.preventDefault();
      const nama = document.getElementById('prof-nama')?.value?.trim();
      const noHp = document.getElementById('prof-phone')?.value?.trim();
      const alamat = document.getElementById('prof-alamat')?.value?.trim();
      const jabatan = document.getElementById('prof-jabatan')?.value?.trim();
      const avatarUrl = document.getElementById('prof-avatar')?.value?.trim();
      const bio = document.getElementById('prof-bio')?.value?.trim();
      const newPass = document.getElementById('prof-new-pass')?.value;
      const confirmPass = document.getElementById('prof-confirm-pass')?.value;
      const user = window.KasRT.Auth?.user;

      if (!user) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Sesi Anda tidak ditemukan. Silakan login kembali.', 'error');
        return;
      }
      if (!nama) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Nama lengkap wajib diisi.', 'error');
        return;
      }

      const patch = { nama, noHp, alamat, jabatan, bio, avatarUrl };
      if (newPass || confirmPass) {
        if (newPass !== confirmPass) {
          if (window.KasRT.UI) window.KasRT.UI.showToast('Kata sandi baru dan konfirmasi sandi tidak cocok.', 'error');
          return;
        }
        if (newPass.length < 4) {
          if (window.KasRT.UI) window.KasRT.UI.showToast('Kata sandi baru minimal 4 karakter.', 'error');
          return;
        }
        patch.password = newPass;
      }

      const btn = document.getElementById('btn-save-profile');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined text-lg animate-spin">refresh</span><span>Menyimpan...</span>`;
      }

      try {
        await window.KasRT.UserStore.update(user.id, patch);
        const db = window.KasRT.DB;
        if (db) {
          const resId = user.residentId;
          if (resId && db.get('residents', resId)) {
            await db.update('residents', resId, { nama, noHp, alamat });
          } else if (user.email) {
            const resident = db.list('residents').find(r => r.email && r.email.toLowerCase() === user.email.toLowerCase());
            if (resident) {
              await db.update('residents', resident.id, { nama, noHp, alamat });
            }
          }
        }
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Foto profil dan data akun Anda berhasil diperbarui!', 'success');
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Gagal menyimpan profil: ' + err.message, 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span class="material-symbols-outlined text-lg">save</span><span>Simpan Perubahan Profil Saya</span>`;
        }
      }
    },

    renderOrganizationTab(settings) {
      const isDemo = (window.KasRT.LandingMode ? window.KasRT.LandingMode.isDemo() : false);
      const currentAppName = settings.appName || 'Kas RT';
      const currentAppTagline = settings.appTagline || 'Kas Transparan';
      const currentLogoCustom = settings.appLogoCustom || '';

      return `
        <div class="space-y-6 text-xs">
          <!-- 1. KARTU PENGATURAN LOGO, NAMA APLIKASI & TAGLINE FLEKSIBEL -->
          <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-xs space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant">
              <div>
                <span class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 inline-block mb-1">
                  Branding Fleksibel
                </span>
                <h3 class="font-extrabold text-base text-on-surface font-display flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-xl">palette</span>
                  <span>Pengaturan Logo, Nama Aplikasi & Tagline</span>
                </h3>
                <p class="text-slate-500 text-[11px] mt-0.5">
                  Ubah nama aplikasi, slogan/tagline pendek, dan logo sesuai identitas paguyuban Anda. Perubahan akan langsung tampil di seluruh sistem.
                </p>
              </div>
              <button type="button" onclick="KasRT.Pages.Settings.resetBrandingToDefault()" class="px-3.5 py-1.5 rounded-xl border border-outline-variant hover:bg-surface-container font-bold text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer self-start sm:self-auto">
                <span class="material-symbols-outlined text-base">restart_alt</span>
                <span>Reset ke Default (Kas RT)</span>
              </button>
            </div>

            <!-- LIVE INTERACTIVE BRANDING PREVIEW -->
            <div class="p-4 rounded-2xl bg-surface-container/40 border border-outline-variant/70 space-y-2">
              <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pratinjau Langsung (Live Preview di Header / Topbar):</span>
              <div id="branding-live-preview-box" class="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 overflow-hidden min-w-0">
                  <div id="preview-logo-container" class="shrink-0 drop-shadow-md flex items-center justify-center">
                    ${currentLogoCustom ? `
                      <img src="${currentLogoCustom}" alt="${currentAppName}" class="w-10 h-10 rounded-2xl object-contain border border-outline-variant/40 bg-surface-container/20 p-0.5" />
                    ` : (window.KasRT?.UI?.getLogoSvg ? window.KasRT.UI.getLogoSvg(40) : '<div class="w-10 h-10 rounded-2xl bg-theme-gradient text-white font-black flex items-center justify-center">K</div>')}
                  </div>
                  <div class="flex flex-col min-w-0 leading-tight">
                    <span id="preview-app-name" class="font-extrabold text-base sm:text-lg tracking-tight font-display text-on-surface truncate">${currentAppName}</span>
                    <span id="preview-app-tagline" class="text-xs text-slate-500 font-medium truncate mt-0.5">${currentAppTagline}</span>
                  </div>
                </div>
                <div class="hidden sm:flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span class="material-symbols-outlined text-base">verified</span>
                  <span>Tampilan Siap Pakai</span>
                </div>
              </div>
            </div>

            <!-- FORM BRANDING -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-xs text-on-surface mb-1.5">
                  Nama Aplikasi <span class="text-rose-500">*</span>
                </label>
                <input type="text" id="app-nama" value="${currentAppName}" required placeholder="Contoh: Kas RT" oninput="KasRT.Pages.Settings.updateBrandingLivePreview()" class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <span class="text-[11px] text-slate-400 mt-1 block">Default bawaan sistem: <strong>Kas RT</strong>.</span>
              </div>
              <div>
                <label class="block font-bold text-xs text-on-surface mb-1.5">
                  Tagline / Slogan Pendek Aplikasi
                </label>
                <input type="text" id="app-tagline" value="${currentAppTagline}" placeholder="Contoh: Kas Transparan" oninput="KasRT.Pages.Settings.updateBrandingLivePreview()" class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <span class="text-[11px] text-slate-400 mt-1 block">Slogan pendek di bawah nama aplikasi. Default: <strong>Kas Transparan</strong>.</span>
              </div>
            </div>

            <!-- PENGATURAN LOGO APLIKASI -->
            <div class="pt-2 border-t border-outline-variant/60 space-y-3">
              <label class="block font-bold text-xs text-on-surface">Pilihan Logo Aplikasi:</label>
              <div class="flex flex-wrap items-center gap-2">
                <input type="file" id="app-logo-file" accept="image/*" class="hidden" onchange="KasRT.Pages.Settings.handleLogoFileChange(event)" />
                <button type="button" onclick="document.getElementById('app-logo-file').click()" class="px-4 py-2.5 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined text-base">add_photo_alternate</span>
                  <span>Unggah File Logo dari Perangkat</span>
                </button>
                <button type="button" onclick="KasRT.Pages.Settings.removeCustomLogo()" class="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest hover:bg-surface-container font-bold text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined text-base text-primary">auto_awesome</span>
                  <span>Gunakan Logo Vektor Bawaan</span>
                </button>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-500 mb-1">Atau masukkan URL gambar / data URL logo langsung:</label>
                <div class="relative">
                  <input type="text" id="app-logo-custom" value="${currentLogoCustom}" placeholder="https://domain.com/logo.png atau data:image/..." oninput="KasRT.Pages.Settings.updateBrandingLivePreview()" class="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <span class="material-symbols-outlined text-slate-400 text-sm absolute left-3 top-2.5">link</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. IDENTITAS RESMI ORGANISASI RT/RW -->
          <form onsubmit="KasRT.Pages.Settings.handleSaveOrg(event)" class="space-y-4">
            <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-xs space-y-4">
              <div class="pb-3 border-b border-outline-variant">
                <h3 class="font-extrabold text-base text-on-surface font-display flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-xl">apartment</span>
                  <span>Identitas Resmi Organisasi RT/RW</span>
                </h3>
                <p class="text-slate-500 text-[11px] mt-0.5">Informasi ini akan tertera pada seluruh KOP surat, laporan kas resmi, dan kuitansi warga</p>
              </div>

              <div>
                <label class="block font-bold mb-1">Nama Organisasi / Paguyuban RT</label>
                <input type="text" id="org-nama" value="${settings.namaOrganisasi || 'Rukun Tetangga 01 / RW 01'}" required class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm font-semibold" />
              </div>

              <div>
                <label class="block font-bold mb-1">Alamat Lengkap Balai / Sekretariat</label>
                <textarea id="org-alamat" rows="2" class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm">${settings.alamat || ''}</textarea>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold mb-1">Nama Ketua RT</label>
                  <input type="text" id="org-ketua" value="${settings.namaKetua || ''}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
                </div>
                <div>
                  <label class="block font-bold mb-1">Nama Bendahara RT</label>
                  <input type="text" id="org-bendahara" value="${settings.namaBendahara || ''}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold mb-1">Nomor Kontak / WhatsApp Resmi</label>
                  <input type="text" id="org-phone" value="${settings.noHpKontak || ''}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
                </div>
                <div>
                  <label class="block font-bold mb-1">Kota / Kabupaten Penetapan</label>
                  <input type="text" id="org-kota" value="${settings.kota || 'Magelang'}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
                </div>
              </div>

              <!-- PENGATURAN MODE TAMPILAN (DEMO VS PRODUKSI RESMI) - DENGAN RE-RENDER INSTAN -->
              <div class="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold text-on-surface">Mode Tampilan Aplikasi (Landing Mode)</h4>
                    <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${!isDemo ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
                      ${!isDemo ? 'Aktif: Produksi Resmi' : 'Aktif: Mode Demo'}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5">
                    Mode Demo menampilkan tombol "Coba Demo" dan login 1-klik akun demo. Mode Produksi Resmi <strong>menyembunyikannya 100%</strong> agar siap dipakai warga.
                  </p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button 
                    type="button" 
                    onclick="KasRT.Pages.Settings.switchLandingMode('demo')" 
                    class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isDemo 
                        ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400/40' 
                        : 'bg-surface-lowest text-slate-600 dark:text-slate-300 border border-outline-variant hover:bg-surface-container'
                    }"
                  >
                    Demo
                  </button>
                  <button 
                    type="button" 
                    onclick="KasRT.Pages.Settings.switchLandingMode('production')" 
                    class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !isDemo 
                        ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/40' 
                        : 'bg-surface-lowest text-slate-600 dark:text-slate-300 border border-outline-variant hover:bg-surface-container'
                    }"
                  >
                    Produksi Resmi
                  </button>
                </div>
              </div>
            </div>

            <!-- TOMBOL SIMPAN KESELURUHAN -->
            <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span class="text-slate-400 text-xs">Perubahan nama, tagline, logo, dan identitas akan otomatis berlaku di semua perangkat</span>
              <button type="submit" id="btn-save-org" class="px-8 py-3 rounded-2xl bg-theme-gradient text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-xl">save</span>
                <span>Simpan Pengaturan Logo, Nama & Organisasi</span>
              </button>
            </div>
          </form>
        </div>
      `;
    },

    // Switch Landing Mode (Demo vs Production) secara instan dan re-render seketika
    async switchLandingMode(targetMode) {
      if (window.KasRT && window.KasRT.LandingMode) {
        try {
          await window.KasRT.LandingMode.setMode(targetMode);
          if (window.KasRT.Events) {
            window.KasRT.Events.handleRouting();
          }
        } catch (err) {
          if (window.KasRT.UI) {
            window.KasRT.UI.showToast(err.message, 'error');
          }
        }
      }
    },

    handleLogoFileChange(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Harap pilih file gambar logo (PNG, JPG, SVG, WebP).', 'error');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Ukuran file logo maksimal 8 MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = file.type === 'image/svg+xml' ? e.target.result : canvas.toDataURL('image/png');
          const logoInput = document.getElementById('app-logo-custom');
          if (logoInput) logoInput.value = dataUrl;
          SettingsPage.updateBrandingLivePreview();
          if (window.KasRT.UI) window.KasRT.UI.showToast('File logo berhasil dimuat! Klik "Simpan Pengaturan Logo, Nama & Organisasi" untuk menerapkan.', 'success');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeCustomLogo() {
      const logoInput = document.getElementById('app-logo-custom');
      if (logoInput) logoInput.value = '';
      this.updateBrandingLivePreview();
      if (window.KasRT.UI) window.KasRT.UI.showToast('Logo kustom dibersihkan. Menggunakan logo vektor Kas RT.', 'info');
    },

    resetBrandingToDefault() {
      const nameInput = document.getElementById('app-nama');
      const taglineInput = document.getElementById('app-tagline');
      const logoInput = document.getElementById('app-logo-custom');
      if (nameInput) nameInput.value = 'Kas RT';
      if (taglineInput) taglineInput.value = 'Kas Transparan';
      if (logoInput) logoInput.value = '';
      this.updateBrandingLivePreview();
      if (window.KasRT.UI) window.KasRT.UI.showToast('Pengaturan branding dikembalikan ke default Kas RT. Silakan klik simpan.', 'info');
    },

    updateBrandingLivePreview() {
      const name = document.getElementById('app-nama')?.value?.trim() || 'Kas RT';
      const tagline = document.getElementById('app-tagline')?.value?.trim() || 'Kas Transparan';
      const customLogo = document.getElementById('app-logo-custom')?.value?.trim() || '';
      const nameEl = document.getElementById('preview-app-name');
      const taglineEl = document.getElementById('preview-app-tagline');
      const logoContainer = document.getElementById('preview-logo-container');

      if (nameEl) nameEl.textContent = name;
      if (taglineEl) taglineEl.textContent = tagline;
      if (logoContainer) {
        if (customLogo) {
          logoContainer.innerHTML = `
            <img src="${customLogo}" alt="${name}" class="w-10 h-10 rounded-2xl object-contain border border-outline-variant/40 bg-surface-container/20 p-0.5" onerror="this.outerHTML=KasRT.UI.getLogoSvg(40);" />
          `;
        } else {
          logoContainer.innerHTML = window.KasRT?.UI?.getLogoSvg ? window.KasRT.UI.getLogoSvg(40) : '<div class="w-10 h-10 rounded-2xl bg-theme-gradient text-white font-black flex items-center justify-center">K</div>';
        }
      }
    },

    async handleSaveOrg(e) {
      e.preventDefault();
      const appName = document.getElementById('app-nama')?.value?.trim() || 'Kas RT';
      const appTagline = document.getElementById('app-tagline')?.value?.trim() || 'Kas Transparan';
      const appLogoCustom = document.getElementById('app-logo-custom')?.value?.trim() || '';
      const namaOrganisasi = document.getElementById('org-nama')?.value;
      const alamat = document.getElementById('org-alamat')?.value;
      const namaKetua = document.getElementById('org-ketua')?.value;
      const namaBendahara = document.getElementById('org-bendahara')?.value;
      const noHpKontak = document.getElementById('org-phone')?.value;
      const kota = document.getElementById('org-kota')?.value;
      
      // Ambil mode saat ini agar tidak ter-reset
      const landingMode = window.KasRT.LandingMode ? window.KasRT.LandingMode.getMode() : 'demo';

      const btn = document.getElementById('btn-save-org');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined text-lg animate-spin">refresh</span><span>Menyimpan...</span>`;
      }

      try {
        await window.KasRT.DB.update('settings', 'global', {
          appName,
          appTagline,
          appLogoCustom,
          namaOrganisasi,
          alamat,
          namaKetua,
          namaBendahara,
          noHpKontak,
          kota,
          landingMode
        });

        document.title = `${appName} - ${appTagline}`;
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Branding "${appName}" dan identitas organisasi berhasil disimpan!`, 'success');
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Gagal menyimpan: ' + err.message, 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span class="material-symbols-outlined text-xl">save</span><span>Simpan Pengaturan Logo, Nama & Organisasi</span>`;
        }
      }
    },

    renderFinanceTab() {
      const db = window.KasRT.DB;
      const accounts = db.list('cashAccounts');
      return `
        <div class="space-y-6 text-xs">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-base text-on-surface">Rekening & Akun Kas Lingkungan</h3>
              <p class="text-slate-500">Kelola buku rekening bank dan brankas fisik kas RT</p>
            </div>
            <button onclick="KasRT.Pages.Settings.openAddAccountModal()" class="px-3.5 py-1.5 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer">
              <span class="material-symbols-outlined text-base">add</span>
              <span>Tambah Rekening</span>
            </button>
          </div>
          <div class="space-y-3">
            ${accounts.map(acc => {
              const txCount = db.list('transactions').filter(t => t.cashAccountId === acc.id).length;
              return `
                <div class="p-4 rounded-2xl bg-surface-container/30 border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-sm text-on-surface truncate">${acc.nama}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${acc.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700'}">${acc.status}</span>
                      ${txCount > 0 ? `<span class="text-[10px] text-slate-400 font-mono">(${txCount} transaksi)</span>` : '<span class="text-[10px] text-amber-600 dark:text-amber-400 font-medium">(Belum ada transaksi)</span>'}
                    </div>
                    <p class="text-slate-500 mt-0.5 truncate">${acc.keterangan || '-'}</p>
                  </div>
                  <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div class="text-right">
                      <span class="text-[10px] text-slate-400 font-bold uppercase">Saldo Saat Ini:</span>
                      <div class="text-base font-black font-mono text-on-surface">${Utils.formatRp(acc.saldoSaatIni || 0)}</div>
                    </div>
                    <button type="button" onclick="KasRT.Pages.Settings.handleDeleteAccount('${acc.id}', '', ${txCount})" class="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer shrink-0" title="Hapus Akun Kas Ini">
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    async handleDeleteAccount(id, namaParam, txCount) {
      const db = window.KasRT.DB;
      const targetAcc = db.get('cashAccounts', id);
      const nama = namaParam || targetAcc?.nama || 'Akun Kas';
      const allAccounts = db.list('cashAccounts');
      if (allAccounts.length <= 1) {
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Gagal menghapus: Sistem memerlukan minimal 1 akun kas aktif untuk operasional.', 'error');
        }
        return;
      }
      let warningMsg = `Apakah Anda yakin ingin menghapus rekening kas "${nama}"? Akun kas yang sudah tidak dipakai akan dihapus dari daftar.`;
      if (txCount > 0) {
        warningMsg += ` Rekening ini memiliki catatan ${txCount} transaksi terdahulu.`;
      }
      const confirmed = await window.KasRT.UI.confirmModal({
        title: `Hapus Akun Kas "${nama}"`,
        message: warningMsg,
        confirmText: 'Ya, Hapus Rekening',
        cancelText: 'Batal',
        danger: true
      });
      if (!confirmed) return;
      try {
        await db.remove('cashAccounts', id);
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Akun kas "${nama}" berhasil dihapus.`, 'success');
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Gagal menghapus akun: ' + err.message, 'error');
        }
      }
    },

    openAddAccountModal() {
      const html = `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Tambah Rekening Kas Baru</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Settings.handleSubmitAddAccount(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Nama Akun / Rekening</label>
              <input type="text" id="acc-nama" required placeholder="Contoh: Bank BSI Rekening Iuran" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-bold mb-1">Saldo Awal Pembukaan (Rp)</label>
              ${window.KasRT.UI.renderCurrencyInput({
                id: 'acc-saldo',
                value: 0
              })}
            </div>
            <div>
              <label class="block font-bold mb-1">Keterangan / Nomor Rekening</label>
              <input type="text" id="acc-desc" placeholder="No Rek: 7123-xxx-xxx atas nama RT" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan Akun</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'sm' });
    },

    async handleSubmitAddAccount(e) {
      e.preventDefault();
      const nama = document.getElementById('acc-nama')?.value;
      const saldoAwal = Utils.parseNumber(document.getElementById('acc-saldo')?.value || 0);
      const keterangan = document.getElementById('acc-desc')?.value;
      const db = window.KasRT.DB;
      const id = db.nextId('ACC', 'cashAccounts');
      await db.set('cashAccounts', {
        id,
        nama,
        saldoAwal,
        saldoSaatIni: saldoAwal,
        keterangan,
        status: 'Aktif'
      });
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast(`Akun "${nama}" berhasil didaftarkan!`, 'success');
        window.KasRT.UI.closeModal();
      }
      window.KasRT.Events.handleRouting();
    },

    renderPolicyTab(settings) {
      return `
        <div class="space-y-6 text-xs">
          <div>
            <h3 class="font-bold text-base text-on-surface">Kebijakan Iuran & Tenor Cicilan</h3>
            <p class="text-slate-500">Aturan standar penagihan iuran bulanan dan batas tenor cicilan warga</p>
          </div>
          <form onsubmit="KasRT.Pages.Settings.handleSavePolicy(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Iuran Default Bulanan (Rp)</label>
                ${window.KasRT.UI.renderCurrencyInput({
                  id: 'pol-nominal',
                  value: settings.iuranDefault || 50000
                })}
              </div>
              <div>
                <label class="block font-bold mb-1">Tanggal Batas Jatuh Tempo</label>
                <input type="number" id="pol-due" value="${settings.jatuhTempoHari || 10}" min="1" max="28" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">Maksimal Tenor Cicilan (Bulan)</label>
              <input type="number" id="pol-tenor" value="${settings.maksTenor || 12}" min="3" max="24" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
              <p class="text-[10px] text-slate-400 mt-1">Batas tenor maksimal yang diizinkan untuk skema angsuran warga.</p>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end">
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-md cursor-pointer">Simpan Kebijakan</button>
            </div>
          </form>
        </div>
      `;
    },

    async handleSavePolicy(e) {
      e.preventDefault();
      const iuranDefault = Utils.parseNumber(document.getElementById('pol-nominal')?.value || 50000);
      const jatuhTempoHari = parseInt(document.getElementById('pol-due')?.value || 10, 10);
      const maksTenor = parseInt(document.getElementById('pol-tenor')?.value || 12, 10);
      await window.KasRT.DB.update('settings', 'global', {
        iuranDefault,
        jatuhTempoHari,
        maksTenor
      });
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast('Kebijakan iuran berhasil disimpan!', 'success');
      }
      window.KasRT.Events.handleRouting();
    },

    renderKopTab() {
      return `
        <div id="kop-editor-root">
          ${window.KasRT.Reports.KopEditor ? window.KasRT.Reports.KopEditor.render() : ''}
        </div>
      `;
    },

    renderThemeTab() {
      const gradients = window.KasRT.Constants.GRADIENTS;
      const currentGrad = window.KasRT.Theme.currentGradient;
      const currentMode = window.KasRT.Theme.currentMode;
      const gradientList = Object.values(gradients);

      return `
        <div class="space-y-3 text-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-outline-variant/60">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-extrabold text-sm sm:text-base text-on-surface flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-primary text-lg">palette</span>
                  <span>Tampilan & Pilihan Tema Gradien Modern</span>
                </h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                  ${gradientList.length} Tema
                </span>
              </div>
              <p class="text-slate-500 text-[11px] mt-0.5">Pilih mode tampilan antarmuka & 12 tema gradien (klik untuk langsung terapkan)</p>
            </div>
            <div class="flex items-center p-1 bg-surface-container/70 rounded-xl border border-outline-variant/70 shrink-0 gap-1 self-start sm:self-auto shadow-2xs">
              <button onclick="KasRT.Theme.applyMode('light'); KasRT.Events.handleRouting();" 
                      title="Mode Terang (Light)"
                      class="px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentMode === 'light' ? 'bg-surface-lowest text-amber-500 shadow-xs ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 hover:text-on-surface'}">
                <span class="material-symbols-outlined text-base text-amber-500">light_mode</span>
                <span class="text-[11px]">Terang</span>
              </button>
              <button onclick="KasRT.Theme.applyMode('dark'); KasRT.Events.handleRouting();" 
                      title="Mode Gelap (Dark)"
                      class="px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentMode === 'dark' ? 'bg-surface-lowest text-indigo-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 hover:text-on-surface'}">
                <span class="material-symbols-outlined text-base text-indigo-400">dark_mode</span>
                <span class="text-[11px]">Gelap</span>
              </button>
              <button onclick="KasRT.Theme.applyMode('system'); KasRT.Events.handleRouting();" 
                      title="Sistem Otomatis Sesuai Perangkat"
                      class="px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentMode === 'system' ? 'bg-surface-lowest text-primary shadow-xs ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 hover:text-on-surface'}">
                <span class="material-symbols-outlined text-base text-slate-400">settings_brightness</span>
                <span class="text-[11px]">Otomatis</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
            ${gradientList.map(g => {
              const isSelected = currentGrad === g.id;
              const swatches = g.swatches || [g.start, g.via, g.end];
              return `
                <div onclick="KasRT.Theme.setGradient('${g.id}'); KasRT.Events.handleRouting(); KasRT.UI.showToast('Tema diubah ke: ${g.name}', 'success');" 
                     title="${g.name} - ${g.description}"
                     class="p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${isSelected ? 'border-primary ring-2 ring-primary/40 shadow-xs bg-primary/5' : 'border-outline-variant hover:border-slate-300 dark:hover:border-slate-600 bg-surface-lowest'} flex flex-col justify-between group">
                  <div>
                    <div class="flex items-center justify-between gap-1 mb-1.5">
                      <h4 class="font-bold text-[11px] text-on-surface truncate group-hover:text-primary transition-colors pr-1">${g.name}</h4>
                      <div class="flex items-center gap-1 shrink-0">
                        ${g.badge ? `<span class="px-1.5 py-0.5 rounded-md text-[8.5px] font-extrabold ${isSelected ? 'bg-primary text-white' : 'bg-surface-container text-slate-500'}">${g.badge}</span>` : ''}
                        ${isSelected ? '<span class="material-symbols-outlined text-xs text-primary font-bold">check_circle</span>' : ''}
                      </div>
                    </div>
                    <div class="h-6 sm:h-7 rounded-lg shadow-2xs mb-1.5 transition-transform group-hover:scale-[1.01]" style="background: linear-gradient(135deg, ${g.start}, ${g.via}, ${g.end});"></div>
                    <div class="flex items-center gap-0.5 mb-1.5">
                      ${swatches.map(c => `
                        <span class="flex-1 h-1.5 rounded-[2px] border border-black/5 dark:border-white/5" style="background-color: ${c}" title="${c}"></span>
                      `).join('')}
                    </div>
                    <p class="text-[10px] text-slate-500 leading-tight truncate mb-1" title="${g.description}">${g.description}</p>
                  </div>
                  <div class="flex items-center justify-between pt-1 border-t border-outline-variant/60 text-[9px] text-slate-400">
                    <span class="font-mono text-[9px]">${g.start}</span>
                    <span class="font-bold text-[9.5px] ${isSelected ? 'text-primary' : 'text-slate-400 group-hover:text-primary transition-colors'}">${isSelected ? '✓ Aktif' : 'Terapkan'}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    renderNotificationTab() {
      const db = window.KasRT.DB;
      const notifs = db.list('notifications');
      return `
        <div class="space-y-4 text-xs">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-base text-on-surface">Pemberitahuan & Notifikasi Sistem</h3>
            <button onclick="KasRT.Shell.markAllNotificationsRead()" class="text-xs font-bold text-primary hover:underline cursor-pointer">Tandai Semua Dibaca</button>
          </div>
          <div class="space-y-3">
            ${notifs.map(n => `
              <div class="p-4 rounded-2xl bg-surface-container/30 border border-outline-variant flex items-start justify-between gap-4">
                <div>
                  <h4 class="font-bold text-on-surface">${n.judul}</h4>
                  <p class="text-slate-500 mt-1">${n.pesan}</p>
                </div>
                <span class="text-[10px] text-slate-400 font-mono whitespace-nowrap">${Utils.relTime(n.createdAt)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    renderIntegrityTab() {
      return `
        <div class="space-y-6 text-xs">
          <div>
            <h3 class="font-bold text-base text-on-surface">Pemindaian & Integritas Data Sistem</h3>
            <p class="text-slate-500">Periksa saldo drift, kategori yatim, dan duplikasi entitas database</p>
          </div>
          <div class="p-6 rounded-3xl bg-surface-container/40 border border-outline-variant space-y-4 text-center">
            <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <span class="material-symbols-outlined text-2xl">health_and_safety</span>
            </div>
            <h4 class="font-bold text-sm text-on-surface">Audit Otomatis Konsistensi Kas</h4>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              Sistem akan memverifikasi bahwa total mutasi debit/kredit seluruh transaksi sama persis dengan saldo kas yang tersimpan di akun.
            </p>
            <button onclick="KasRT.Pages.Settings.runIntegrityCheck()" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-md cursor-pointer">
              Mulai Pindai Integritas Sekarang
            </button>
          </div>
          <div id="integrity-results-container"></div>
        </div>
      `;
    },

    async runIntegrityCheck() {
      const health = window.KasRT.Features.Health;
      const res = health.scanIntegrity();
      const container = document.getElementById('integrity-results-container');
      if (!container) return;
      if (res.healthy) {
        container.innerHTML = `
          <div class="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl">check_circle</span>
            <div>
              <strong class="block font-bold">Seluruh Data Konsisten & Sehat!</strong>
              <span>Tidak ditemukan adanya saldo drift maupun kategori yatim.</span>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
            <div class="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
              <span class="material-symbols-outlined">warning</span>
              <span>Ditemukan ${res.totalIssues} Ketidaksesuaian:</span>
            </div>
            <ul class="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
              ${res.issues.map(i => `<li>${i.message}</li>`).join('')}
            </ul>
            <div class="pt-2">
              <button onclick="KasRT.Pages.Settings.runAutoRepair()" class="px-5 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-sm cursor-pointer">
                Perbaiki Otomatis (Auto-Repair)
              </button>
            </div>
          </div>
        `;
      }
    },

    async runAutoRepair() {
      const rep = await window.KasRT.Features.Health.autoRepair();
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast(`Berhasil memperbaiki ${rep.repairsCount} masalah integritas data.`, 'success');
      }
      this.runIntegrityCheck();
    },

    renderDangerTab() {
      return `
        <div class="space-y-6 text-xs">
          <div>
            <h3 class="font-bold text-base text-rose-600">Zona Bahaya, Sinkronisasi & Reset Basis Data</h3>
            <p class="text-slate-500">Khusus hak akses Administrator penuh untuk mengelola siklus hidup data sistem</p>
          </div>

          <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant space-y-3">
            <h4 class="font-bold text-sm text-on-surface">Sinkronisasi Database Lokal ke Server (Cloud Firestore)</h4>
            <p class="text-slate-500">Unggah seluruh pembukuan lokal ke server cloud Firebase secara serverless.</p>
            <button onclick="KasRT.DBMonitor.syncLocalToServer()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-base">cloud_sync</span>
              <span>Sinkronkan ke Server Cloud Sekarang</span>
            </button>
          </div>

          <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant space-y-3">
            <h4 class="font-bold text-sm text-on-surface">Cadangkan Database (Backup JSON Penuh)</h4>
            <p class="text-slate-500">Unduh seluruh koleksi database KasRT dalam 1 file JSON terstruktur.</p>
            <button onclick="KasRT.Pages.ImportExport.handleExportJson()" class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm cursor-pointer">
              Unduh Backup Database (.json)
            </button>
          </div>

          <!-- FITUR MEMBERSIHKAN SELURUH DATA DEMO -->
          <div class="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-600 text-xl font-bold">cleaning_services</span>
              <h4 class="font-bold text-sm text-amber-900 dark:text-amber-200">Bersihkan Semua Data Demo (Kosongkan Transaksi)</h4>
            </div>
            <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
              Menghapus seluruh catatan transaksi, mutasi, tagihan iuran, cicilan, jadwal inventaris, dan bukti pembayaran demo. Pengaturan nama aplikasi, rekening kas (saldo 0), kategori, dan peran tetap dipertahankan agar siap diisi data riil warga.
            </p>
            <button type="button" onclick="KasRT.Pages.Settings.handleClearAllDemoData()" class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2">
              <span class="material-symbols-outlined text-base">mop</span>
              <span>Bersihkan Seluruh Data Demo Sekarang</span>
            </button>
          </div>

          <!-- FITUR MENAMBAHKAN / MEMUAT ULANG DATA DEMO LENGKAP -->
          <div class="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-600 text-xl font-bold">dataset</span>
              <h4 class="font-bold text-sm text-indigo-900 dark:text-indigo-200">Tambahkan / Muat Ulang Data Demo Simulasi</h4>
            </div>
            <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
              Mengisi ulang database dengan data simulasi lengkap (12 data KK warga, transaksi kas riil, inventaris peralatan RT, matriks iuran, dan program cicilan) untuk keperluan presentasi atau pelatihan pengurus.
            </p>
            <button type="button" onclick="KasRT.Pages.Settings.handleReloadDemoData()" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2">
              <span class="material-symbols-outlined text-base">add_chart</span>
              <span>Muat / Tambahkan Data Demo Lengkap</span>
            </button>
          </div>

          <div class="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-900 space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-rose-600 text-xl font-bold">delete_forever</span>
              <h4 class="font-bold text-sm text-rose-600">Reset Total Semua Data Pada Database</h4>
            </div>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              PERINGATAN: Tindakan ini hanya dapat dieksekusi oleh pengguna dengan hak akses <strong>Administrator Penuh</strong>. Seluruh data transaksi, mutasi, tagihan, cicilan, dan inventaris akan dikosongkan dan diinisialisasi ulang ke data bersih awal.
            </p>
            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-surface-lowest border border-outline-variant cursor-pointer text-xs font-semibold select-none">
              <input type="checkbox" id="settings-reset-users-checkbox" class="rounded text-rose-600 w-4 h-4 cursor-pointer" />
              <span>Ikut reset data pengguna sistem (akun login & role kustom)</span>
            </label>
            <button onclick="KasRT.Pages.Settings.handleResetDatabaseFromSettings()" class="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700 transition-colors cursor-pointer">
              Reset Semua Data Database
            </button>
          </div>
        </div>
      `;
    },

    async handleResetDatabaseFromSettings() {
      const checkbox = document.getElementById('settings-reset-users-checkbox');
      const resetUsers = checkbox ? checkbox.checked : false;
      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? auth.user : null;
      if (!auth || !auth.Permissions.isAdmin(user)) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Akses Ditolak: Anda tidak memiliki hak Administrator Penuh.', 'error');
        return;
      }
      const promptVal = await window.KasRT.UI.promptInputModal({
        title: 'Konfirmasi Reset Total Basis Data',
        message: `PERINGATAN TINGKAT TINGGI: Tindakan ini akan mengosongkan seluruh data transaksi, tagihan, cicilan, dan inventaris (Reset User: ${resetUsers ? 'YA' : 'TIDAK'}).`,
        requiredText: 'RESET TOTAL BASIS DATA',
        danger: true
      });
      if (promptVal === 'RESET TOTAL BASIS DATA') {
        try {
          const monitor = window.KasRT && window.KasRT.DBMonitor;
          await monitor.resetAllDatabase('RESET TOTAL BASIS DATA', { resetUsers });
          if (window.KasRT.UI) {
            window.KasRT.UI.showToast('Seluruh basis data telah berhasil di-reset ke kondisi awal!', 'info');
          }
          window.KasRT.Events.navigate('#/app/dashboard');
        } catch (err) {
          if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
        }
      }
    },

    async handleClearAllDemoData() {
      const confirmed = await window.KasRT.UI.confirmModal({
        title: 'Bersihkan Semua Data Demo?',
        message: 'Tindakan ini akan mengosongkan seluruh data transaksi kas, tagihan warga, cicilan, dan pemeriksaan inventaris demo. Pengaturan branding dan akun kas Anda akan tetap tersimpan dengan saldo Rp 0.',
        confirmText: 'Ya, Bersihkan Data Demo',
        cancelText: 'Batal',
        danger: true
      });
      if (!confirmed) return;
      const db = window.KasRT.DB;
      if (db && db.clearAllDemoData) {
        db.clearAllDemoData();
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Seluruh data transaksi demo berhasil dibersihkan! Sistem kini dalam keadaan bersih.', 'success');
        }
        window.KasRT.Events.navigate('#/app/dashboard');
      }
    },

    async handleReloadDemoData() {
      const confirmed = await window.KasRT.UI.confirmModal({
        title: 'Muat Ulang Data Demo?',
        message: 'Data simulasi lengkap (warga, transaksi kas operasional, tagihan, dan inventaris) akan dimuat ulang ke dalam database.',
        confirmText: 'Ya, Muat Data Demo',
        cancelText: 'Batal'
      });
      if (!confirmed) return;
      const db = window.KasRT.DB;
      if (db && db.reloadDemoData) {
        db.reloadDemoData();
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Data demo simulasi berhasil ditambahkan & dimuat ulang!', 'success');
        }
        window.KasRT.Events.navigate('#/app/dashboard');
      }
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.Settings = SettingsPage;
  window.KasRT_Pages_Settings_Loaded = true;
})();