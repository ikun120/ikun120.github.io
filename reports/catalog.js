/**
 * KasRT - Report Catalog Registry
 * 21 template laporan resmi (Kas, Warga, Iuran, Cicilan, Sistem) + 10 laporan Inventaris Aset RT
 */
(function() {
  'use strict';
  if (window.KasRT_Reports_Catalog_Loaded) return;

  const CATALOG_SEED = [
    { code: 'KAS-01', name: 'Buku Kas Umum Konsolidasi', group: 'Kas', icon: 'account_balance', desc: 'Arus penerimaan & pengeluaran seluruh akun kas secara kronologis', order: 1, active: true },
    { code: 'KAS-02', name: 'Buku Kas Per Akun', group: 'Kas', icon: 'wallet', desc: 'Buku kas spesifik untuk akun tunai, BCA, atau bank tertentu', order: 2, active: true },
    { code: 'KAS-03', name: 'Rekapitulasi Pemasukan', group: 'Kas', icon: 'arrow_downward', desc: 'Daftar seluruh penerimaan dana terperinci menurut sumber dan pihak', order: 3, active: true },
    { code: 'KAS-04', name: 'Rekapitulasi Pengeluaran', group: 'Kas', icon: 'arrow_upward', desc: 'Rincian belanja operasional, kebersihan, keamanan, dan sosial', order: 4, active: true },
    { code: 'KAS-05', name: 'Arus Kas Per Kategori', group: 'Kas', icon: 'pie_chart', desc: 'Pengelompokan total masuk dan keluar berdasarkan mata pos anggaran', order: 5, active: true },
    { code: 'KAS-06', name: 'Rekonsiliasi Saldo Akun', group: 'Kas', icon: 'sync_alt', desc: 'Perbandingan saldo awal, mutasi berjalan, dan saldo akhir tiap rekening', order: 6, active: true },
    { code: 'KAS-07', name: 'Transfer Antar Kas', group: 'Kas', icon: 'swap_horiz', desc: 'Riwayat pemindahan dana antar brankas tunai dan rekening bank RT', order: 7, active: true },
    { code: 'KAS-08', name: 'Laporan Periode Terkunci', group: 'Kas', icon: 'lock', desc: 'Daftar buku kas yang telah ditutup dan disahkan oleh pengurus', order: 8, active: true },
    { code: 'WRG-01', name: 'Buku Data Warga Lengkap', group: 'Warga', icon: 'groups', desc: 'Sensus dan daftar induk KK warga RT beserta alamat dan nomor kontak', order: 9, active: true },
    { code: 'IUR-01', name: 'Matriks Kepatuhan Iuran', group: 'Iuran', icon: 'grid_on', desc: 'Tabel kepatuhan setoran 12 bulan per Kepala Keluarga warga', order: 10, active: true },
    { code: 'IUR-02', name: 'Aging Piutang & Tunggakan', group: 'Iuran', icon: 'pending_actions', desc: 'Daftar warga yang menunggak dengan klasifikasi usia tunggakan', order: 11, active: true },
    { code: 'IUR-03', name: 'Rekap Pemasukan Iuran', group: 'Iuran', icon: 'receipt', desc: 'Akumulasi iuran rutin bulanan per periode kalender', order: 12, active: true },
    { code: 'IUR-04', name: 'Daftar Keringanan / Bebas', group: 'Iuran', icon: 'volunteer_activism', desc: 'Daftar warga yang mendapatkan pembebasan atau diskon iuran sah', order: 13, active: true },
    { code: 'IUR-05', name: 'Riwayat Pembayaran Warga', group: 'Iuran', icon: 'history', desc: 'Buku rekam pembayaran iuran per individu warga', order: 14, active: true },
    { code: 'IUR-06', name: 'Verifikasi Pembayaran', group: 'Iuran', icon: 'check_circle', desc: 'Log bukti transfer yang diverifikasi atau ditolak bendahara', order: 15, active: true },
    { code: 'SYS-01', name: 'Log Audit Sistem', group: 'Sistem', icon: 'history_edu', desc: 'Catatan jejak aktivitas admin, perubahan saldo, dan keamanan data', order: 16, active: true },
    { code: 'SYS-02', name: 'Daftar Kategori Kas', group: 'Sistem', icon: 'category', desc: 'Struktur kode akun anggaran pemasukan dan pengeluaran RT', order: 17, active: true },
    { code: 'CIC-01', name: 'Monitoring Rencana Cicilan', group: 'Cicilan', icon: 'schedule', desc: 'Portofolio penyelesaian tunggakan yang dijadwalkan bertahap', order: 18, active: true },
    { code: 'CIC-02', name: 'Jadwal Termin Per Rencana', group: 'Cicilan', icon: 'calendar_month', desc: 'Daftar jatuh tempo dan kumulatif angsuran per debitur warga', order: 19, active: true },
    { code: 'CIC-03', name: 'Alokasi FIFO Setoran', group: 'Cicilan', icon: 'low_priority', desc: 'Audit pembagian setoran bertahap ke termin terlama (FIFO)', order: 20, active: true },
    { code: 'CIC-04', name: 'Riwayat Reminder WhatsApp', group: 'Cicilan', icon: 'chat', desc: 'Catatan pengiriman pesan penagihan ramah ke nomor warga', order: 21, active: true },
    { code: 'INV-01', name: 'Daftar Inventaris & Aset RT', group: 'Inventaris', icon: 'inventory_2', desc: 'Buku induk seluruh barang perlengkapan dan peralatan RT', order: 22, active: true },
    { code: 'INV-02', name: 'Ringkasan Kondisi Barang', group: 'Inventaris', icon: 'health_and_safety', desc: 'Statistik rasio barang kondisi baik vs rusak/cacat', order: 23, active: true },
    { code: 'INV-03', name: 'Nilai & Distribusi Kategori Aset', group: 'Inventaris', icon: 'category', desc: 'Sebaran inventaris berdasarkan 11 kategori perlengkapan', order: 24, active: true },
    { code: 'INV-04', name: 'Riwayat Pengecekan Fisik', group: 'Inventaris', icon: 'fact_check', desc: 'Laporan berita acara opname fisik oleh tim petugas', order: 25, active: true },
    { code: 'INV-05', name: 'Penyesuaian & Selisih Opname', group: 'Inventaris', icon: 'tune', desc: 'Daftar mutasi koreksi jumlah fisik barang yang berkurang/bertambah', order: 26, active: true },
    { code: 'INV-06', name: 'Aset Membutuhkan Perbaikan', group: 'Inventaris', icon: 'build', desc: 'Daftar alat gotong royong dan sound yang rusak dan perlu servis', order: 27, active: true },
    { code: 'INV-07', name: 'Rekap Petugas & Tim Inventaris', group: 'Inventaris', icon: 'diversity_3', desc: 'Daftar koordinator gudang dan kelompok pemeriksa aset', order: 28, active: true },
    { code: 'INV-08', name: 'Jadwal Pengecekan Mendatang', group: 'Inventaris', icon: 'event', desc: 'Kalender agenda opname berkala triwulanan dan bulanan', order: 29, active: true },
    { code: 'INV-09', name: 'Aset Stale Tanpa Cek >30 Hari', group: 'Inventaris', icon: 'notification_important', desc: 'Peringatan dini barang yang belum diperiksa fisik lebih dari 1 bulan', order: 30, active: true },
    { code: 'INV-10', name: 'Berita Acara Opname Fisik', group: 'Inventaris', icon: 'assignment', desc: 'Format cetak berita acara resmi serah terima dan opname aset', order: 31, active: true }
  ];

  const ReportCatalog = {
    seedList() {
      return CATALOG_SEED.map(item => ({
        id: item.code,
        code: item.code,
        name: item.name,
        group: item.group,
        icon: item.icon || 'description',
        desc: item.desc || '',
        order: item.order || 99,
        active: item.active !== false,
        isDefault: true,
        format: 'PDF, Excel, Word',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z'
      }));
    },

    ensureSeeded() {
      const db = window.KasRT && window.KasRT.DB;
      if (!db) return;
      const existing = db.list('reportCatalog');
      if (!existing || existing.length === 0) {
        const seed = this.seedList();
        seed.forEach(item => {
          db.set('reportCatalog', item);
        });
      }
    },

    list() {
      const db = window.KasRT && window.KasRT.DB;
      if (!db) return [...CATALOG_SEED];
      this.ensureSeeded();
      const items = db.list('reportCatalog');
      if (!items || items.length === 0) return [...CATALOG_SEED];
      return [...items].sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
    },

    getByCode(code) {
      if (!code) return null;
      const cleanCode = String(code).trim().toUpperCase();
      const all = this.list();
      return all.find(r => (r.code && r.code.toUpperCase() === cleanCode) || (r.id && r.id.toUpperCase() === cleanCode)) || null;
    },

    listByGroup(group) {
      const all = this.list();
      if (!group || group === 'Semua') return all;
      return all.filter(r => r.group === group);
    },

    groups() {
      const all = this.list();
      const set = new Set(['Kas', 'Warga', 'Iuran', 'Cicilan', 'Sistem', 'Inventaris']);
      all.forEach(r => {
        if (r.group) set.add(r.group);
      });
      return Array.from(set);
    },

    async create(data, currentUser = null) {
      const db = window.KasRT && window.KasRT.DB;
      if (!db) throw new Error('Database belum siap.');
      const code = String(data.code || '').trim().toUpperCase();
      if (!code) throw new Error('Kode laporan wajib diisi (contoh: KAS-09).');
      if (this.getByCode(code)) {
        throw new Error(`Kode laporan "${code}" sudah terdaftar. Silakan gunakan kode lain.`);
      }
      const name = String(data.name || '').trim();
      if (!name) throw new Error('Nama laporan wajib diisi.');

      const newDoc = {
        id: code,
        code: code,
        name: name,
        group: data.group || 'Kas',
        icon: data.icon || 'description',
        desc: data.desc || '',
        order: Number(data.order) || (this.list().length + 1),
        active: data.active !== false,
        isDefault: false,
        format: data.format || 'PDF, Excel, Word',
        createdAt: (window.KasRT && window.KasRT.Utils) ? window.KasRT.Utils.nowISO() : new Date().toISOString(),
        updatedAt: (window.KasRT && window.KasRT.Utils) ? window.KasRT.Utils.nowISO() : new Date().toISOString()
      };

      await db.set('reportCatalog', newDoc);
      const auth = window.KasRT && window.KasRT.Auth;
      const user = currentUser || (auth ? auth.user : null);
      if (db.log) {
        await db.log(user?.id || 'staff', 'CREATE_REPORT_CATALOG_ITEM', 'reportCatalog', code, null, newDoc);
      }
      return newDoc;
    },

    async update(code, data, currentUser = null) {
      const db = window.KasRT && window.KasRT.DB;
      if (!db) throw new Error('Database belum siap.');
      const existing = this.getByCode(code);
      if (!existing) throw new Error(`Laporan dengan kode "${code}" tidak ditemukan.`);

      const updated = {
        ...existing,
        name: data.name !== undefined ? String(data.name).trim() : existing.name,
        group: data.group !== undefined ? data.group : existing.group,
        icon: data.icon !== undefined ? data.icon : existing.icon,
        desc: data.desc !== undefined ? data.desc : existing.desc,
        order: data.order !== undefined ? Number(data.order) : existing.order,
        active: data.active !== undefined ? Boolean(data.active) : existing.active,
        format: data.format !== undefined ? data.format : existing.format,
        updatedAt: (window.KasRT && window.KasRT.Utils) ? window.KasRT.Utils.nowISO() : new Date().toISOString()
      };

      await db.update('reportCatalog', existing.id || code, updated);
      const auth = window.KasRT && window.KasRT.Auth;
      const user = currentUser || (auth ? auth.user : null);
      if (db.log) {
        await db.log(user?.id || 'staff', 'UPDATE_REPORT_CATALOG_ITEM', 'reportCatalog', code, existing, updated);
      }
      return updated;
    },

    async remove(code, currentUser = null) {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = currentUser || (auth ? auth.user : null);
      const isAdmin = auth && auth.Permissions && auth.Permissions.isAdmin(user);
      if (!isAdmin) {
        throw new Error('Akses Ditolak: Hanya Administrator yang berwenang menghapus template dari Katalog Laporan.');
      }
      const db = window.KasRT && window.KasRT.DB;
      if (!db) throw new Error('Database belum siap.');
      const existing = this.getByCode(code);
      if (!existing) return false;

      await db.remove('reportCatalog', existing.id || code);
      if (db.log) {
        await db.log(user?.id || 'admin', 'DELETE_REPORT_CATALOG_ITEM', 'reportCatalog', code, existing, null);
      }
      return true;
    },

    async toggleActive(code, currentUser = null) {
      const existing = this.getByCode(code);
      if (!existing) return false;
      return await this.update(code, { active: !existing.active }, currentUser);
    },

    async resetToDefault(currentUser = null) {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = currentUser || (auth ? auth.user : null);
      const isAdmin = auth && auth.Permissions && auth.Permissions.isAdmin(user);
      if (!isAdmin) {
        throw new Error('Akses Ditolak: Hanya Administrator yang berwenang mereset template ke bawaan.');
      }
      const db = window.KasRT && window.KasRT.DB;
      if (!db) return;

      const current = db.list('reportCatalog') || [];
      for (const item of current) {
        await db.remove('reportCatalog', item.id || item.code);
      }
      const seed = this.seedList();
      for (const item of seed) {
        await db.set('reportCatalog', item);
      }
      if (db.log) {
        await db.log(user?.id || 'admin', 'RESET_REPORT_CATALOG_DEFAULT', 'reportCatalog', 'ALL', null, { count: seed.length });
      }
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Reports = window.KasRT.Reports || {};
  window.KasRT.Reports.Catalog = ReportCatalog;
  window.KasRT_Reports_Catalog_Loaded = true;
})();
