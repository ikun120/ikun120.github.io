/**
 * KasRT - Layout Menu Registry & Command Palette Items
 * Daftar navigasi terpusat dengan filter RBAC dinamis & Database Monitoring (Admin Only)
 */
(function() {
  'use strict';
  if (window.KasRT_Menu_Loaded) return;

  const STAFF_MENU = [
    {
      section: 'Utama',
      icon: 'space_dashboard',
      color: 'indigo',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '#/app/dashboard', perm: 'view_dashboard', desc: 'Ringkasan saldo, kas masuk & keluar, dan analitik 6 bulan' },
        { id: 'kategori', label: 'Pos & Kategori Kas', icon: 'category', route: '#/app/kategori', perm: 'view_categories', desc: 'Pos anggaran pemasukan dan pos pengeluaran kas RT' },
        { id: 'sumber-dana', label: 'Sumber Dana & Pihak', icon: 'handshake', route: '#/app/sumber-dana', perm: 'manage_categories', desc: 'Konfigurasi pihak ketiga, donatur, dan sumber dana kegiatan' }
      ]
    },
    {
      section: 'Transaksi & Kas',
      icon: 'payments',
      color: 'emerald',
      items: [
        { id: 'transaksi', label: 'Transaksi Kas', icon: 'receipt_long', route: '#/app/transaksi', perm: 'view_transactions', desc: 'Pencatatan kas masuk & keluar, filter rentang tanggal, cetak kuitansi' },
        { id: 'tagihan', label: 'Tagihan Iuran', icon: 'payments', route: '#/app/iuran', perm: 'view_dues', desc: 'Penerbitan tagihan massal, verifikasi setoran, dan matriks 12 bulan' },
        { id: 'cicilan', label: 'Cicilan Terjadwal', icon: 'schedule', route: '#/app/cicilan', perm: 'view_installments', desc: 'Skema cicilan warga, persetujuan, jadwal termin & setoran FIFO' }
      ]
    },
    {
      section: 'Warga & Inventaris',
      icon: 'groups',
      color: 'sky',
      items: [
        { id: 'warga', label: 'Data Warga', icon: 'groups', route: '#/app/warga', perm: 'view_residents', desc: 'Direktori kependudukan, kepala keluarga, nomor KK & kontak warga' },
        { id: 'inventaris', label: 'Daftar Aset RT', icon: 'inventory_2', route: '#/app/inventaris', perm: 'view_inventory', desc: 'Daftar aset fasilitas lingkungan, kondisi barang & lokasi simpan' },
        { id: 'inventaris-kategori', label: 'Kategori Inventaris', icon: 'folder_special', route: '#/app/inventaris-kategori', perm: 'manage_inventory', desc: 'Klasifikasi perlengkapan, tenda, kursi & sarana RT' },
        { id: 'inventaris-petugas', label: 'Petugas Inventaris', icon: 'badge', route: '#/app/inventaris-petugas', perm: 'manage_inventory_officers', desc: 'Daftar penanggung jawab dan pengelola aset RT' },
        { id: 'inventaris-tim', label: 'Tim Pengecekan', icon: 'diversity_3', route: '#/app/inventaris-tim', perm: 'manage_inventory_officers', desc: 'Pembagian tim periksa fisik berimbang sarana RT' },
        { id: 'inventaris-jadwal', label: 'Jadwal Pengecekan', icon: 'event', route: '#/app/inventaris-jadwal', perm: 'manage_inventory', desc: 'Kalender jadwal stock opname dan inspeksi fisik' },
        { id: 'inventaris-pengecekan', label: 'Pemeriksaan Fisik Aset', icon: 'fact_check', route: '#/app/inventaris-pengecekan', perm: 'perform_inventory_check', desc: 'Pengecekan fisik barang, stok opname, bukti foto & selisih' }
      ]
    },
    {
      section: 'Laporan & Ekspor',
      icon: 'description',
      color: 'amber',
      items: [
        { id: 'laporan-katalog', label: 'Katalog Laporan Resmi', icon: 'description', route: '#/app/laporan', perm: 'view_reports', desc: 'Format laporan resmi RT siap cetak PDF, Excel & Word ber-SHA256' },
        { id: 'laporan-periode', label: 'Laporan Periode Kas', icon: 'date_range', route: '#/app/laporan-periode', perm: 'view_reports', desc: 'Laporan arus kas bulanan, triwulan, semester & tahunan' },
        { id: 'laporan-inventaris', label: 'Laporan Inventaris', icon: 'summarize', route: '#/app/laporan-inventaris', perm: 'view_inventory_reports', desc: 'Rekapitulasi kondisi barang, nilai aset & berita acara periksa' }
      ]
    },
    {
      section: 'Administrasi & Database',
      icon: 'tune',
      color: 'violet',
      items: [
        { id: 'db-monitor', label: 'Monitoring Database', icon: 'dns', route: '#/app/db-monitor', perm: 'view_db_monitor', desc: 'Pantau status, kuota penyimpanan, latensi & reset (Khusus Admin)' },
        { id: 'users', label: 'Kelola Pengguna', icon: 'manage_accounts', route: '#/app/users', perm: 'manage_users', desc: 'Akun pengurus, kredensial login, status aktif/nonaktif' },
        { id: 'roles', label: 'Role & Izin Akses', icon: 'security', route: '#/app/roles', perm: 'manage_roles', desc: 'Matriks perizinan RBAC sistem, kustomisasi izin per peran' },
        { id: 'import-export', label: 'Cadangan & Impor Data', icon: 'swap_horiz', route: '#/app/import-export', perm: 'import_export_data', desc: 'Pencadangan JSON, pemulihan database, ekspor Excel semua tabel' }
      ]
    },
    {
      section: 'Pengaturan & Akun',
      icon: 'tune',
      color: 'rose',
      items: [
        { id: 'profil', label: 'Profil Saya', icon: 'person', route: '#/app/profil', perm: '*', desc: 'Informasi akun pribadi, nomor WhatsApp, alamat rumah, dan ganti kata sandi' },
        { id: 'audit', label: 'Log Audit Sistem', icon: 'history', route: '#/app/audit', perm: 'view_audit', desc: 'Riwayat jejak audit integritas transaksi dan modifikasi data' },
        { id: 'settings', label: 'Pengaturan Sistem', icon: 'settings', route: '#/app/settings', perm: 'manage_settings', desc: 'KOP surat, struktur pengurus, nomor rekening, nominal iuran default' }
      ]
    },
    {
      section: 'Portal Warga',
      icon: 'home',
      color: 'indigo',
      items: [
        { id: 'portal', label: 'Portal Warga Saya', icon: 'home', route: '#/app/portal', perm: 'view_portal', desc: 'Ringkasan tagihan pribadi, bukti iuran, dan status keaktifan warga' },
        { id: 'tagihan-saya', label: 'Tagihan Saya', icon: 'payments', route: '#/app/portal-tagihan', perm: 'view_my_dues', desc: 'Daftar kewajiban iuran bulanan dan riwayat pembayaran KK' },
        { id: 'cicilan-saya', label: 'Cicilan Saya', icon: 'schedule', route: '#/app/portal-cicilan', perm: 'view_my_installments', desc: 'Jadwal termin cicilan dan sisa kewajiban aktif' }
      ]
    }
  ];

  const CITIZEN_MENU = [
    {
      section: 'Portal Warga',
      icon: 'home',
      color: 'indigo',
      items: [
        { id: 'portal', label: 'Portal Saya', icon: 'home', route: '#/app/portal', perm: 'view_portal', desc: 'Ringkasan tagihan pribadi, bukti iuran, dan status keaktifan warga' },
        { id: 'tagihan-saya', label: 'Tagihan Saya', icon: 'payments', route: '#/app/portal-tagihan', perm: 'view_my_dues', desc: 'Daftar kewajiban iuran bulanan dan riwayat pembayaran KK' },
        { id: 'cicilan-saya', label: 'Cicilan Saya', icon: 'schedule', route: '#/app/portal-cicilan', perm: 'view_my_installments', desc: 'Jadwal termin cicilan dan sisa kewajiban aktif' },
        { id: 'inventaris-warga', label: 'Inventaris RT', icon: 'inventory_2', route: '#/app/portal-inventaris', perm: 'view_inventory', desc: 'Daftar fasilitas & sarana RT yang dapat dipinjam warga' }
      ]
    },
    {
      section: 'Akun & Profil',
      icon: 'person',
      color: 'rose',
      items: [
        { id: 'profil', label: 'Profil Saya', icon: 'person', route: '#/app/profil', perm: '*', desc: 'Informasi akun pribadi, nomor WhatsApp, alamat rumah, dan ganti kata sandi' }
      ]
    }
  ];

  const MenuRegistry = {
    customSections: [],
    get(user = null) {
      const auth = window.KasRT && window.KasRT.Auth;
      let currentUser = user || (auth ? (auth.user || (auth.getUser && auth.getUser())) : null);
      if (!currentUser && window.KasRT && window.KasRT.DB) {
        const users = window.KasRT.DB.list('users') || [];
        currentUser = users.find(u => u.roles && u.roles.includes('Admin')) || users[0] || null;
      }
      const isWargaOnly = (currentUser && auth && auth.Permissions) ? auth.Permissions.isWarga(currentUser) : false;
      const baseSections = isWargaOnly ? CITIZEN_MENU : STAFF_MENU;
      const combined = [...baseSections, ...this.customSections];
      const hasPermission = (perm) => {
        if (!perm || perm === '*') return true;
        if (!currentUser) return false;
        if (!auth || !auth.Permissions) return false;
        return auth.Permissions.has(perm, currentUser);
      };
      return combined.map(sec => {
        const validItems = sec.items.filter(item => hasPermission(item.perm));
        return {
          section: sec.section,
          icon: sec.icon || 'menu',
          color: sec.color || 'indigo',
          items: validItems
        };
      }).filter(sec => sec.items.length > 0);
    },
    getForCommandPalette() {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? (auth.user || (auth.getUser && auth.getUser())) : null;
      const sections = this.get(user);
      const flat = [];
      sections.forEach(sec => {
        sec.items.forEach(item => {
          flat.push({
            id: item.id,
            label: item.label,
            icon: item.icon,
            route: item.route,
            section: sec.section,
            desc: item.desc || ''
          });
        });
      });
      return flat;
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.MenuRegistry = MenuRegistry;
  window.KasRT_Menu_Loaded = true;
})();
