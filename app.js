/**
 * KasRT - Application Bootstrapper & Central Routing Controller
 * Menghubungkan seluruh modul, registrasi router lengkap, dan auto-inisialisasi
 */
(function() {
  'use strict';

  async function initApp() {
    console.info('[KasRT] Memulai inisialisasi aplikasi KasRT Harmoni...');

    // 1. Inisialisasi Tema & Tampilan
    if (window.KasRT && window.KasRT.Theme) {
      window.KasRT.Theme.init();
    }

    // 2. Inisialisasi Basis Data (LocalStorage Cache & Firebase Firestore)
    if (window.KasRT && window.KasRT.DB) {
      try {
        await window.KasRT.DB.init();
        const settings = window.KasRT.DB.get('settings', 'global') || {};
        const appName = settings.appName || 'Kas RT';
        const appTagline = settings.appTagline || 'Kas Transparan';
        document.title = `${appName} - ${appTagline}`;
        console.info(`[KasRT] Basis data berhasil dimuat (${appName}). Mode:`, window.KasRT.DB.mode);
      } catch (err) {
        console.warn('[KasRT] Peringatan saat inisialisasi basis data:', err);
      }
    }

    // 3. Inisialisasi Autentikasi Pengguna
    if (window.KasRT && window.KasRT.Auth) {
      window.KasRT.Auth.init();
    }

    // 4. Inisialisasi DB Monitor & Sinkronisasi
    if (window.KasRT && window.KasRT.DBMonitor) {
      window.KasRT.DBMonitor.init();
    }

    // 5. Registrasi Seluruh Route Aplikasi
    registerRoutes();

    // 6. Jalankan Hash Router
    if (window.KasRT && window.KasRT.Events) {
      window.KasRT.Events.initRouter();
    }

    console.info('[KasRT] Aplikasi siap digunakan.');
  }

  function registerRoutes() {
    const Events = window.KasRT.Events;
    const Shell = window.KasRT.Shell;
    const Pages = window.KasRT.Pages;
    const appEl = document.getElementById('app');

    if (!Events || !Pages) return;

    // --- HALAMAN PUBLIK (Tanpa App Shell) ---
    Events.addRoute('/landing', () => {
      if (appEl && Pages.Public) {
        appEl.innerHTML = Pages.Public.renderLanding();
      }
    });

    Events.addRoute('/login', () => {
      if (appEl && Pages.Public) {
        appEl.innerHTML = Pages.Public.renderLogin();
      }
    });

    Events.addRoute('/register', () => {
      if (appEl && Pages.Public) {
        appEl.innerHTML = Pages.Public.renderRegister();
      }
    });

    Events.addRoute('/demo-roles', () => {
      if (appEl && Pages.Public) {
        appEl.innerHTML = Pages.Public.renderDemoRoles();
      }
    });

    // --- DASHBOARD & ANALITIK ---
    Events.addRoute('/app/dashboard', () => {
      if (Pages.Dashboard && Shell) {
        Shell.render(Pages.Dashboard.render(), { title: 'Dashboard & Ringkasan Kas' });
        if (typeof Pages.Dashboard.initCharts === 'function') {
          setTimeout(() => Pages.Dashboard.initCharts(), 50);
        }
      }
    }, { perm: 'view_dashboard' });

    // --- TRANSAKSI KAS ---
    Events.addRoute('/app/transaksi', () => {
      if (Pages.Transactions && Shell) {
        Shell.render(Pages.Transactions.render(), { title: 'Buku Transaksi Kas RT' });
      }
    }, { perm: 'view_transactions' });

    // --- POS ANGGARAN & SUMBER DANA ---
    Events.addRoute('/app/kategori', () => {
      if (Pages.Categories && Shell) {
        Shell.render(Pages.Categories.renderCategories(), { title: 'Pos Anggaran Kas RT' });
      }
    }, { perm: 'view_categories' });

    Events.addRoute('/app/sumber-dana', () => {
      if (Pages.Categories && Shell) {
        Shell.render(Pages.Categories.renderSources(), { title: 'Sumber Dana & Donatur' });
      }
    }, { perm: 'manage_categories' });

    // --- IURAN & CICILAN ---
    Events.addRoute('/app/iuran', () => {
      if (Pages.Dues && Shell) {
        Shell.render(Pages.Dues.render(), { title: 'Tagihan & Iuran Lingkungan' });
      }
    }, { perm: 'view_dues' });

    Events.addRoute('/app/cicilan', () => {
      if (Pages.Installments && Shell) {
        Shell.render(Pages.Installments.render(), { title: 'Cicilan Kewajiban Terjadwal' });
      }
    }, { perm: 'view_installments' });

    // --- WARGA ---
    Events.addRoute('/app/warga', () => {
      if (Pages.Residents && Shell) {
        Shell.render(Pages.Residents.render(), { title: 'Direktori Kependudukan RT' });
      }
    }, { perm: 'view_residents' });

    // --- INVENTARIS ASET FASILITAS RT ---
    Events.addRoute('/app/inventaris', () => {
      if (Pages.Inventory && Shell) {
        Shell.render(Pages.Inventory.renderItemList(), { title: 'Daftar Aset Sarana RT' });
      }
    }, { perm: 'view_inventory' });

    Events.addRoute('/app/inventaris-kategori', () => {
      if (Pages.Inventory && Shell) {
        const html = typeof Pages.Inventory.renderCategories === 'function'
          ? Pages.Inventory.renderCategories()
          : Pages.Inventory.renderCategoryList();
        Shell.render(html, { title: 'Kategori Perlengkapan & Aset' });
      }
    }, { perm: 'manage_inventory' });

    Events.addRoute('/app/inventaris-petugas', () => {
      if (Pages.Inventory && Shell) {
        const html = typeof Pages.Inventory.renderOfficers === 'function'
          ? Pages.Inventory.renderOfficers()
          : Pages.Inventory.renderOfficerList();
        Shell.render(html, { title: 'Penanggung Jawab Inventaris' });
      }
    }, { perm: 'manage_inventory_officers' });

    Events.addRoute('/app/inventaris-tim', () => {
      if (Pages.Inventory && Shell) {
        const html = typeof Pages.Inventory.renderTeams === 'function'
          ? Pages.Inventory.renderTeams()
          : Pages.Inventory.renderTeamList();
        Shell.render(html, { title: 'Tim Pengecekan Fisik Berimbang' });
      }
    }, { perm: 'manage_inventory_officers' });

    Events.addRoute('/app/inventaris-jadwal', () => {
      if (Pages.Inventory && Shell) {
        const html = typeof Pages.Inventory.renderSchedules === 'function'
          ? Pages.Inventory.renderSchedules()
          : Pages.Inventory.renderScheduleList();
        Shell.render(html, { title: 'Jadwal Stock Opname & Inspeksi' });
      }
    }, { perm: 'manage_inventory' });

    Events.addRoute('/app/inventaris-pengecekan', () => {
      if (Pages.Inventory && Shell) {
        const html = typeof Pages.Inventory.renderPhysicalChecks === 'function'
          ? Pages.Inventory.renderPhysicalChecks()
          : Pages.Inventory.renderCheckForm();
        Shell.render(html, { title: 'Pemeriksaan Fisik Sarana' });
      }
    }, { perm: 'perform_inventory_check' });

    // --- LAPORAN & EKSPOR ---
    Events.addRoute('/app/laporan', () => {
      if (Pages.ReportsCatalog && Shell) {
        const content = typeof Pages.ReportsCatalog.renderCatalog === 'function'
          ? Pages.ReportsCatalog.renderCatalog()
          : Pages.ReportsCatalog.render();
        Shell.render(content, { title: 'Katalog Format Laporan Resmi' });
      }
    }, { perm: 'view_reports' });

    Events.addRoute('/app/laporan-periode', () => {
      if (Pages.PeriodReports && Shell) {
        Shell.render(Pages.PeriodReports.render(), { title: 'Laporan Berkala Arus Kas' });
      }
    }, { perm: 'view_reports' });

    Events.addRoute('/app/laporan-inventaris', () => {
      if (Pages.Inventory && Shell) {
        const viewHtml = typeof Pages.Inventory.renderReportList === 'function'
          ? Pages.Inventory.renderReportList()
          : (typeof Pages.Inventory.renderCitizenInventoryView === 'function'
              ? Pages.Inventory.renderCitizenInventoryView()
              : Pages.Inventory.renderItemList());
        Shell.render(viewHtml, { title: 'Laporan Aset Lingkungan' });
      }
    }, { perm: 'view_inventory_reports' });

    // --- DATABASE MONITORING & ADMINISTRASI ---
    Events.addRoute('/app/db-monitor', () => {
      if (Pages.DBMonitor && Shell) {
        Shell.render(Pages.DBMonitor.render(), { title: 'Monitoring Database Real-Time' });
      }
    }, { perm: 'view_db_monitor' });

    Events.addRoute('/app/users', () => {
      if (Pages.UsersRoles && Shell) {
        Shell.render(Pages.UsersRoles.renderUsers(), { title: 'Manajemen Akun Pengguna' });
      }
    }, { perm: 'manage_users' });

    Events.addRoute('/app/roles', () => {
      if (Pages.UsersRoles && Shell) {
        Shell.render(Pages.UsersRoles.renderRoles(), { title: 'Matriks Izin Akses RBAC' });
      }
    }, { perm: 'manage_roles' });

    Events.addRoute('/app/import-export', () => {
      if (Pages.ImportExport && Shell) {
        Shell.render(Pages.ImportExport.render(), { title: 'Cadangan & Pemulihan Data' });
      }
    }, { perm: 'import_export_data' });

    Events.addRoute('/app/audit', () => {
      if (Pages.Audit && Shell) {
        Shell.render(Pages.Audit.render(), { title: 'Log Audit Integritas Sistem' });
      }
    }, { perm: 'view_audit' });

    // --- PENGATURAN & PROFIL PENGGUNA ---
    Events.addRoute('/app/profil', () => {
      if (Pages.Settings && Shell) {
        Shell.render(Pages.Settings.render('profil'), { title: 'Profil Saya' });
      }
    }, { perm: '*' });

    Events.addRoute('/app/settings', (route) => {
      if (Pages.Settings && Shell) {
        const auth = window.KasRT.Auth;
        const user = auth ? auth.user : null;
        const isAdmin = auth && auth.Permissions && auth.Permissions.isAdmin(user);
        const canManageSettings = isAdmin || (auth && auth.Permissions && auth.Permissions.has('manage_settings', user));
        const defaultTab = canManageSettings ? 'organisasi' : 'profil';
        const tab = (route && route.query && route.query.tab) || defaultTab;
        const pageTitle = tab === 'profil' ? 'Profil Saya' : 'Pengaturan Sistem';
        Shell.render(Pages.Settings.render(tab), { title: pageTitle });
      }
    }, { perm: '*' });

    // --- PORTAL KHUSUS WARGA ---
    Events.addRoute('/app/portal', () => {
      if (Pages.Dashboard && Shell) {
        Shell.render(Pages.Dashboard.render(), { title: 'Portal Transparansi Warga' });
      }
    }, { perm: 'view_portal' });

    Events.addRoute('/app/portal-tagihan', () => {
      if (Pages.Dues && Shell) {
        Shell.render(Pages.Dues.render(), { title: 'Tagihan Iuran Saya' });
      }
    }, { perm: 'view_my_dues' });

    Events.addRoute('/app/portal-cicilan', () => {
      if (Pages.Installments && Shell) {
        Shell.render(Pages.Installments.render(), { title: 'Cicilan Saya' });
      }
    }, { perm: 'view_my_installments' });

    Events.addRoute('/app/portal-inventaris', () => {
      if (Pages.Inventory && Shell) {
        const viewHtml = typeof Pages.Inventory.renderCitizenInventoryView === 'function'
          ? Pages.Inventory.renderCitizenInventoryView()
          : Pages.Inventory.renderItemList();
        Shell.render(viewHtml, { title: 'Peminjaman Fasilitas & Aset RT' });
      }
    }, { perm: 'view_inventory' });
  }

  // Jalankan ketika seluruh DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
