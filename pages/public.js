/**
 * KasRT - Public Views (Landing Page, Login, Register, Demo Roles & Onboarding)
 * Terintegrasi penuh dengan LandingMode (Mode Produksi Resmi vs Mode Demo)
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_Public_Loaded) return;

  const Utils = window.KasRT.Utils;

  const PublicPages = {
    renderLanding() {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const user = auth ? auth.user : null;
      const isWarga = (auth && auth.Permissions) ? auth.Permissions.isWarga(user) : false;
      const homeLink = isWarga ? '#/app/portal' : '#/app/dashboard';
      const homeTitle = isWarga ? 'Portal Warga' : 'Dashboard';
      const settings = (db && db.get('settings', 'global')) || {};
      
      // Deteksi mode: true jika Demo, false jika Produksi Resmi
      const isDemo = (window.KasRT.LandingMode ? window.KasRT.LandingMode.isDemo() : false);
      const appName = settings.appName || 'Kas RT';
      const appTagline = settings.appTagline || 'Kas Transparan';

      return `
        <div class="min-h-screen bg-surface text-on-surface flex flex-col font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
          <!-- TOP NAVBAR -->
          <header class="h-18 sm:h-20 border-b border-outline-variant/60 bg-surface-lowest/90 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-8 lg:px-12 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
            <div class="flex items-center gap-2 sm:gap-3 min-w-0">
              <a href="${homeLink}" class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                ${(window.KasRT && window.KasRT.UI && window.KasRT.UI.renderBrandLogo)
                  ? window.KasRT.UI.renderBrandLogo({ size: 38, subtitle: settings.namaOrganisasi })
                  : `
                    <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-theme-gradient text-white flex items-center justify-center font-black font-display text-lg sm:text-xl shadow-lg shrink-0">${appName.charAt(0)}</div>
                    <div class="min-w-0">
                      <h1 class="font-extrabold text-base sm:text-lg tracking-tight font-display text-on-surface truncate">${appName}</h1>
                      <p class="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-[120px] sm:max-w-[180px]">${settings.namaOrganisasi || 'RT 01 / RW 01'}</p>
                    </div>
                  `}
              </a>
            </div>

            <!-- Navigasi Toolbar Atas: HANYA tampil jika user sudah login -->
            ${user ? `
              <nav class="hidden lg:flex items-center gap-1.5 lg:gap-2">
                ${isWarga ? `
                  <a href="#/app/portal" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-surface-container transition-colors">
                    <span class="material-symbols-outlined text-lg">home</span>
                    <span>Portal Saya</span>
                  </a>
                  <a href="#/app/portal-tagihan" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-surface-container transition-colors">
                    <span class="material-symbols-outlined text-lg">payments</span>
                    <span>Tagihan Saya</span>
                  </a>
                ` : `
                  <a href="#/app/dashboard" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-surface-container transition-colors">
                    <span class="material-symbols-outlined text-lg">dashboard</span>
                    <span>Dashboard</span>
                  </a>
                  <a href="#/app/transaksi" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-surface-container transition-colors">
                    <span class="material-symbols-outlined text-lg">receipt_long</span>
                    <span>Transaksi</span>
                  </a>
                  <a href="#/app/iuran" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-surface-container transition-colors">
                    <span class="material-symbols-outlined text-lg">payments</span>
                    <span>Iuran</span>
                  </a>
                  <a href="#/app/warga" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-surface-container transition-colors">
                    <span class="material-symbols-outlined text-lg">groups</span>
                    <span>Warga</span>
                  </a>
                `}
              </nav>
            ` : ''}

            <!-- Tombol Pojok Kanan Atas -->
            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button onclick="KasRT.UI.openThemePickerModal()" title="Pilih Tema Warna & Gradien" class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary hover:bg-surface-container transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-lg sm:text-xl">palette</span>
              </button>
              <button onclick="KasRT.Theme.toggle()" class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-surface-container cursor-pointer" title="Ganti Mode Gelap / Terang">
                <span class="material-symbols-outlined text-lg sm:text-xl dark:hidden">dark_mode</span>
                <span class="material-symbols-outlined text-lg sm:text-xl hidden dark:inline">light_mode</span>
              </button>

              ${user ? `
                <a href="${homeLink}" class="hidden sm:inline-flex px-3.5 py-2 text-xs sm:text-sm font-bold text-primary hover:bg-primary/10 rounded-xl transition-colors">Buka ${homeTitle}</a>
                <button onclick="KasRT.Auth.logout()" class="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer">Keluar</button>
              ` : `
                ${/* TOMBOL COBA DEMO HANYA TAMPIL JIKA isDemo AKTIF */ isDemo ? `
                  <a href="#/demo-roles" class="inline-flex px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 transition-colors items-center gap-1 cursor-pointer">
                    <span class="material-symbols-outlined text-sm">play_circle</span>
                    <span class="hidden xs:inline">Demo</span>
                  </a>
                ` : ''}
                <a href="#/login" class="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-theme-gradient rounded-xl shadow-md hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined text-sm">login</span>
                  <span>Masuk</span>
                </a>
              `}
            </div>
          </header>

          <!-- HERO SECTION -->
          <section class="py-10 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto text-center flex flex-col items-center relative">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-bold mb-4 sm:mb-6 border border-primary/20 text-center max-w-full whitespace-normal leading-snug">
              <span class="material-symbols-outlined text-sm shrink-0">verified</span>
              <span>Sistem Pembukuan RT/RW Modern SaaS-Grade Serverless</span>
            </div>
            <h2 class="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-on-surface max-w-3xl leading-tight sm:leading-tight">
              Manajemen Keuangan & Aset Rukun Tetangga yang <span class="text-gradient">Akuntabel & Terbuka</span>
            </h2>
            <p class="text-xs sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mt-3 sm:mt-4 leading-relaxed">
              Selamat datang di portal resmi ${settings.namaOrganisasi || 'Kumpulan Warga RT 01'}. Pencatatan iuran transparan, pengawasan kas realtime, konektivitas database Firebase & lokal, dan pengelolaan inventaris yang rapi.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mt-6 sm:mt-8">
              ${user ? `
                <a href="${homeLink}" class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-theme-gradient text-white font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span class="material-symbols-outlined text-lg">${isWarga ? 'home' : 'dashboard'}</span>
                  <span>Buka ${homeTitle}</span>
                </a>
                <button onclick="KasRT.Auth.logout()" class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-surface-lowest text-rose-600 font-bold text-sm border border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span class="material-symbols-outlined text-lg">logout</span>
                  <span>Keluar Akun</span>
                </button>
              ` : `
                <a href="#/login" class="w-full sm:w-auto px-7 py-3 rounded-2xl bg-theme-gradient text-white font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span class="material-symbols-outlined text-lg">login</span>
                  <span>Masuk ke Akun</span>
                </a>
                ${/* TOMBOL COBA MODE DEMO (7 ROLE) HANYA TAMPIL JIKA isDemo AKTIF */ isDemo ? `
                  <a href="#/demo-roles" class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-surface-lowest text-on-surface font-bold text-sm border border-outline-variant hover:border-primary hover:bg-surface-container transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                    <span class="material-symbols-outlined text-amber-500">play_circle</span>
                    <span>Coba Mode Demo (7 Role)</span>
                  </a>
                ` : ''}
              `}
            </div>
          </section>

          <!-- FEATURES HIGHLIGHT CARDS -->
          <section class="px-4 sm:px-8 max-w-5xl mx-auto w-full mb-12">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                    <span class="material-symbols-outlined text-xl">account_balance_wallet</span>
                  </div>
                  <h3 class="font-bold text-sm sm:text-base text-on-surface mb-1">Kas & Transaksi Realtime</h3>
                  <p class="text-xs text-slate-500 leading-relaxed">Catat pemasukan dan pengeluaran kas RT secara transparan dengan rincian kategori dan pos anggaran yang akurat.</p>
                </div>
              </div>

              <div class="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3">
                    <span class="material-symbols-outlined text-xl">payments</span>
                  </div>
                  <h3 class="font-bold text-sm sm:text-base text-on-surface mb-1">Manajemen Iuran Warga</h3>
                  <p class="text-xs text-slate-500 leading-relaxed">Kelola tagihan iuran bulanan, warga aktif, verifikasi pembayaran, dan pemantauan tunggakan secara otomatis.</p>
                </div>
              </div>

              <div class="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant/80 shadow-xs flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                <div>
                  <div class="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-3">
                    <span class="material-symbols-outlined text-xl">shield_person</span>
                  </div>
                  <h3 class="font-bold text-sm sm:text-base text-on-surface mb-1">Multi-Role & Akses Aman</h3>
                  <p class="text-xs text-slate-500 leading-relaxed">Hak akses khusus untuk Admin, Bendahara, Sekretaris, hingga Portal Mandiri Warga yang aman dan terstruktur.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- FOOTER -->
          <footer class="mt-auto py-8 border-t border-outline-variant px-4 sm:px-8 text-center text-xs text-slate-400">
            <p>© 2026 ${appName}. Diterbitkan untuk ${settings.namaOrganisasi || 'Rukun Tetangga'}. Mendukung GitHub Pages & Firebase Serverless.</p>
          </footer>
        </div>
      `;
    },

    renderLogin() {
      const db = window.KasRT.DB;
      const settings = (db && db.get('settings', 'global')) || {};
      const appName = settings.appName || 'Kas RT';
      const appTagline = settings.appTagline || 'Kas Transparan';
      
      // Deteksi mode demo
      const isDemo = (window.KasRT.LandingMode ? window.KasRT.LandingMode.isDemo() : false);
      const customLogo = settings.appLogoCustom && settings.appLogoCustom.trim();
      const logoEl = customLogo
        ? `<img src="${customLogo}" alt="${appName}" class="w-14 h-14 rounded-2xl object-contain border border-outline-variant/60 bg-surface-container/20 p-1 shadow-md" onerror="this.outerHTML=KasRT.UI.getLogoSvg(52);" />`
        : ((window.KasRT && window.KasRT.UI && window.KasRT.UI.getLogoSvg)
            ? window.KasRT.UI.getLogoSvg(52)
            : `<div class="w-12 h-12 rounded-2xl bg-theme-gradient text-white flex items-center justify-center font-black font-display text-2xl shadow-lg">${appName.charAt(0)}</div>`);

      return `
        <div class="min-h-screen bg-surface flex items-center justify-center p-4">
          <div class="w-full max-w-md bg-surface-lowest p-8 rounded-3xl border border-outline-variant shadow-2xl">
            <div class="flex items-center justify-between pb-3 mb-6 border-b border-outline-variant text-xs">
              <a href="#/landing" class="text-slate-500 hover:text-primary font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">arrow_back</span>
                <span>Halaman Depan</span>
              </a>
              ${/* TOMBOL COBA ROLE DEMO HANYA JIKA MODE DEMO */ isDemo ? `
                <a href="#/demo-roles" class="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 hover:underline">
                  <span class="material-symbols-outlined text-sm">play_circle</span>
                  <span>Coba Role Demo</span>
                </a>
              ` : ''}
            </div>

            <div class="text-center mb-6">
              <a href="#/landing" class="inline-flex drop-shadow-md mb-2 hover:scale-105 transition-transform" title="${appName}">
                ${logoEl}
              </a>
              <h2 class="text-2xl font-black font-display text-on-surface">Masuk ke ${appName}</h2>
              <p class="text-sm text-slate-500 mt-1">${appTagline}</p>
            </div>

            <form id="login-form" onsubmit="event.preventDefault(); KasRT.Pages.Public.handleLogin(event); return false;" class="space-y-4">
              <div>
                <label class="block text-sm font-bold mb-1.5 text-on-surface">Email atau Username</label>
                <!-- JIKA PRODUKSI: Input kosong bersih (tidak membocorkan akun demo) -->
                <input 
                  type="text" 
                  id="login-email" 
                  value="${isDemo ? 'admin@kasrt.id' : ''}" 
                  required 
                  placeholder="${isDemo ? 'admin@kasrt.id' : 'Masukkan email atau username'}" 
                  class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium" 
                  autofocus
                />
              </div>

              <div>
                <label class="block text-sm font-bold mb-1.5 text-on-surface">Kata Sandi</label>
                <input 
                  type="password" 
                  id="login-password" 
                  value="${isDemo ? 'demo123' : ''}" 
                  placeholder="••••••••" 
                  class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono" 
                />
              </div>

              <button type="submit" id="btn-login-submit" class="w-full py-3 rounded-xl bg-theme-gradient text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer">
                Masuk Sekarang
              </button>
            </form>

            ${/* BLOK MASUK CEPAT 1-KLIK AKUN DEMO HANYA TAMPIL DI MODE DEMO */ isDemo ? `
              <div class="mt-5 pt-4 border-t border-outline-variant/60">
                <span class="block text-xs font-bold text-slate-500 mb-2.5 text-center">Masuk Cepat 1-Klik Akun Demo:</span>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <button type="button" onclick="KasRT.Pages.Public.quickSelectRole('admin@kasrt.id')" class="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 text-left flex items-center gap-2 transition-colors cursor-pointer">
                    <span class="material-symbols-outlined text-lg text-indigo-600">shield_person</span>
                    <div class="truncate">
                      <span class="block leading-tight font-extrabold text-xs">Admin RT</span>
                      <span class="block text-[11px] text-slate-400 font-normal">Akses Penuh</span>
                    </div>
                  </button>
                  <button type="button" onclick="KasRT.Pages.Public.quickSelectRole('bendahara@kasrt.id')" class="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-left flex items-center gap-2 transition-colors cursor-pointer">
                    <span class="material-symbols-outlined text-lg text-emerald-600">account_balance_wallet</span>
                    <div class="truncate">
                      <span class="block leading-tight font-extrabold text-xs">Bendahara</span>
                      <span class="block text-[11px] text-slate-400 font-normal">Kas & Iuran</span>
                    </div>
                  </button>
                  <button type="button" onclick="KasRT.Pages.Public.quickSelectRole('sekretaris@kasrt.id')" class="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800 text-left flex items-center gap-2 transition-colors cursor-pointer">
                    <span class="material-symbols-outlined text-lg text-sky-600">badge</span>
                    <div class="truncate">
                      <span class="block leading-tight font-extrabold text-xs">Sekretaris</span>
                      <span class="block text-[11px] text-slate-400 font-normal">Warga & Surat</span>
                    </div>
                  </button>
                  <button type="button" onclick="KasRT.Pages.Public.quickSelectRole('warga@kasrt.demo')" class="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 text-left flex items-center gap-2 transition-colors cursor-pointer">
                    <span class="material-symbols-outlined text-lg text-amber-600">person</span>
                    <div class="truncate">
                      <span class="block leading-tight font-extrabold text-xs">Warga RT</span>
                      <span class="block text-[11px] text-slate-400 font-normal">Portal Mandiri</span>
                    </div>
                  </button>
                </div>
              </div>

              <div class="mt-6 pt-5 border-t border-outline-variant text-center space-y-2">
                <a href="#/demo-roles" class="block text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  Atau Gunakan Login Cepat Demo (7 Role Sistem)
                </a>
                <p class="text-xs text-slate-400">
                  Belum punya akun? <a href="#/register" class="text-primary font-bold hover:underline">Daftar Akun Baru</a>
                </p>
              </div>
            ` : `
              <!-- PADA MODE PRODUKSI: HANYA TAMPIL TEKS DAFTAR AKUN BARU -->
              <div class="mt-6 pt-5 border-t border-outline-variant text-center">
                <p class="text-xs text-slate-400">
                  Belum punya akun? <a href="#/register" class="text-primary font-bold hover:underline">Daftar Akun Baru</a>
                </p>
              </div>
            `}
          </div>
        </div>
      `;
    },

    renderRegister() {
      return `
        <div class="min-h-screen bg-surface flex items-center justify-center p-4">
          <div class="w-full max-w-md bg-surface-lowest p-8 rounded-3xl border border-outline-variant shadow-2xl">
            <div class="text-center mb-6">
              <a href="#/landing" class="inline-flex drop-shadow-md mb-2 hover:scale-105 transition-transform" title="KasRT Harmoni">
                ${(window.KasRT && window.KasRT.UI && window.KasRT.UI.getLogoSvg) 
                   ? window.KasRT.UI.getLogoSvg(52) 
                   : `<div class="w-12 h-12 rounded-2xl bg-theme-gradient text-white flex items-center justify-center font-black font-display text-2xl shadow-lg">K</div>`}
              </a>
              <h2 class="text-2xl font-black font-display text-on-surface">Pendaftaran Akun</h2>
              <p class="text-sm text-slate-500 mt-1">Daftarkan akun pengurus atau warga lingkungan RT</p>
            </div>
            <form onsubmit="KasRT.Pages.Public.handleRegister(event)" class="space-y-3 text-xs">
              <div>
                <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Nama Lengkap</label>
                <input type="text" id="reg-nama" required placeholder="Budi Santoso" class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm" />
              </div>
              <div>
                <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Email Aktif</label>
                <input type="email" id="reg-email" required placeholder="budi@contoh.com" class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm" />
              </div>
              <div>
                <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">No. HP / WhatsApp</label>
                <input type="tel" id="reg-phone" placeholder="08123456789" class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm" />
              </div>
              <div>
                <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Kata Sandi</label>
                <input type="password" id="reg-password" required placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm" />
              </div>
              <button type="submit" class="w-full py-3 rounded-xl bg-theme-gradient text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity mt-4 cursor-pointer">
                Daftar & Masuk
              </button>
            </form>
            <div class="mt-6 text-center text-xs text-slate-400">
              Sudah memiliki akun? <a href="#/login" class="text-primary font-bold hover:underline">Masuk</a>
            </div>
          </div>
        </div>
      `;
    },

    renderDemoRoles() {
      const isDemo = (window.KasRT.LandingMode ? window.KasRT.LandingMode.isDemo() : false);
      if (!isDemo) {
        if (window.KasRT && window.KasRT.UI) {
          window.KasRT.UI.showToast('Mode demonstrasi dinonaktifkan dalam mode produksi resmi.', 'info');
        }
        window.location.hash = '#/login';
        return '';
      }

      const roles = (window.KasRT && window.KasRT.Auth && window.KasRT.Auth.Permissions) ? window.KasRT.Auth.Permissions.roles() : window.KasRT.Constants.SYSTEM_ROLES;
      return `
        <div class="min-h-screen bg-surface p-4 sm:p-8 lg:p-12 max-w-5xl mx-auto flex flex-col justify-center">
          <div class="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant text-xs">
            <a href="#/landing" class="text-slate-500 hover:text-primary font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              <span>Halaman Depan</span>
            </a>
            <div class="flex items-center gap-2">
              <a href="#/login" class="px-3 py-1.5 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-xs hover:opacity-90 flex items-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined text-sm">login</span>
                <span>Masuk Akun</span>
              </a>
            </div>
          </div>

          <div class="text-center mb-8">
            <a href="#/landing" class="inline-flex w-12 h-12 rounded-2xl bg-theme-gradient text-white items-center justify-center font-black font-display text-2xl shadow-lg mb-3">K</a>
            <h2 class="text-2xl sm:text-3xl font-black font-display text-on-surface">Pilih Role Demonstrasi KasRT</h2>
            <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2">
              Klik salah satu role untuk langsung masuk dan menguji hak akses serta fitur KasRT tanpa kata sandi:
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${roles.map(r => `
              <div onclick="KasRT.Auth.demoLogin('${r.id}').then(() => KasRT.Events.navigate('#/app/dashboard'))" class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant hover:border-primary hover:shadow-xl cursor-pointer transition-all flex flex-col justify-between group">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-md" style="background-color: ${r.color}">
                      <span class="material-symbols-outlined text-2xl">${r.icon}</span>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Instan</span>
                  </div>
                  <h3 class="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">${r.name}</h3>
                  <p class="text-xs text-slate-500 mt-1 leading-relaxed">${r.description}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Masuk sebagai ${r.name}</span>
                  <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="mt-8 text-center">
            <a href="#/landing" class="text-xs text-slate-400 hover:text-slate-600 font-semibold">Kembali ke Beranda</a>
          </div>
        </div>
      `;
    },

    async quickSelectRole(email, pass = 'demo123') {
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      if (emailInput) emailInput.value = email;
      if (passInput) passInput.value = pass;
      await this.handleLogin();
    },

    async handleLogin(e) {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }
      const btn = document.getElementById('btn-login-submit');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="inline-flex items-center gap-2"><span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span>Memproses Masuk...</span></span>`;
      }
      const emailRaw = document.getElementById('login-email')?.value || '';
      const passRaw = document.getElementById('login-password')?.value || '';
      const email = String(emailRaw).trim();
      const pass = String(passRaw).trim();
      try {
        const loggedUser = await window.KasRT.Auth.login(email, pass);
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Berhasil masuk sebagai ${loggedUser.nama || 'Pengguna'}!`, 'success');
        }
        const auth = window.KasRT.Auth;
        const isWarga = (auth && auth.Permissions && auth.Permissions.isWarga(loggedUser)) ||
                        (window.KasRT.Permissions && window.KasRT.Permissions.isWarga(loggedUser));
        const targetRoute = isWarga ? '#/app/portal' : '#/app/dashboard';
        window.KasRT.Events.navigate(targetRoute);
      } catch (err) {
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(err.message || 'Gagal masuk', 'error');
        }
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `Masuk Sekarang`;
        }
      }
      return false;
    },

    async handleRegister(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const nama = document.getElementById('reg-nama')?.value;
      const email = document.getElementById('reg-email')?.value;
      const pass = document.getElementById('reg-password')?.value;
      const phone = document.getElementById('reg-phone')?.value;
      try {
        const newUser = await window.KasRT.Auth.register(email, pass, nama, phone);
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Akun ${newUser.nama} berhasil dibuat!`, 'success');
        }
        window.KasRT.Events.navigate('#/app/dashboard');
      } catch (err) {
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(err.message || 'Gagal mendaftar akun', 'error');
        }
      }
      return false;
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.Public = PublicPages;
  window.KasRT_Pages_Public_Loaded = true;
})();