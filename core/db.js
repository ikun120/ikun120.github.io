/**
 * KasRT - Core Database Adapter, Storage & Idempotency
 * Mendukung Mode Demo (localStorage) & Mode Firebase Firestore serverless untuk GitHub Pages,
 * cache in-memory 30+ koleksi, audit trail, cascade delete, dan storage Base64/Cloud
 */
(function() {
  'use strict';
  if (window.KasRT_DB_Loaded) return;

  const Constants = window.KasRT.Constants;
  const Utils = window.KasRT.Utils;
  const FirebaseConfig = window.KasRT.FirebaseConfig;

  const ALL_COLLECTIONS = [
    'users', 'residents', 'cashAccounts', 'categories', 'transactions', 'duesTypes',
    'duesBills', 'duesPayments', 'auditLogs', 'policySettings', 'installmentPlans',
    'installmentPlanBills', 'installmentSchedules', 'paymentAllocations',
    'reminderLogs', 'receipts', 'accountTransfers', 'periodLocks', 'notifications',
    'sourceCategories', 'roles', 'reportCatalog', 'inventoryCategories',
    'inventoryItems', 'inventoryOfficers', 'inventorySchedules', 'inventoryChecks',
    'inventoryAdjustments', 'roleOverrides', 'inventoryGroups', 'settings',
    'systemActivityLogs'
  ];

  class DatabaseAdapter {
    constructor() {
      this.mode = (FirebaseConfig && FirebaseConfig.FIREBASE_ENABLED) ? 'firebase' : 'demo';
      this.cache = {};
      ALL_COLLECTIONS.forEach(col => {
        this.cache[col] = [];
      });
      this.isLoaded = false;
      this.initPromise = null;
    }

    async init() {
      if (this.initPromise) return this.initPromise;
      this.initPromise = this.loadAll();
      return this.initPromise;
    }

    async loadAll() {
      const raw = localStorage.getItem(Constants.LS_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          ALL_COLLECTIONS.forEach(col => {
            this.cache[col] = Array.isArray(parsed[col]) ? parsed[col] : [];
          });
          if (!this.cache.settings || this.cache.settings.length === 0) {
            this.cache.settings = [this.getDefaultSettings()];
          } else if (this.cache.settings[0]) {
            const s = this.cache.settings[0];
            if (!s.appName || s.appName === 'Rukun') {
              s.appName = 'Kas RT';
            }
            if (!s.appTagline) {
              s.appTagline = 'Kas Transparan';
            }
          }
          if (!this.cache.roles || this.cache.roles.length === 0) {
            this.cache.roles = JSON.parse(JSON.stringify(Constants.SYSTEM_ROLES));
          }
        } catch (e) {
          console.warn('[KasRT DB] Failed to parse local storage, restoring seed:', e);
          this.seedDemoData();
        }
      } else {
        this.seedDemoData();
      }

      if (this.mode === 'firebase' && window.firebase && window.firebase.firestore) {
        try {
          const db = window.firebase.firestore();
          const loadPromises = ALL_COLLECTIONS.map(async col => {
            try {
              const snap = await Promise.race([
                db.collection(col).get(),
                new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 2500))
              ]);
              if (snap && !snap.empty) {
                this.cache[col] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              }
            } catch (err) {}
          });
          await Promise.all(loadPromises);
        } catch (e) {
          console.warn('[KasRT DB] Firebase load error, keeping local cache:', e);
        }
      }

      this.isLoaded = true;
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('db:loaded', { mode: this.mode });
      }
      return this.cache;
    }

    persistDemo() {
      try {
        localStorage.setItem(Constants.LS_KEY, JSON.stringify(this.cache));
      } catch (e) {
        console.error('[KasRT DB] LocalStorage quota exceeded or error:', e);
      }
    }

    getDefaultSettings() {
      return {
        id: 'global',
        appName: 'Kas RT',
        appTagline: 'Kas Transparan',
        appLogoType: 'preset',
        appLogoCustom: '',
        namaOrganisasi: 'Kumpulan Warga RT 01',
        namaKop: 'Kumpulan Warga',
        subKop: 'Komunitas Warga Masyarakat RT 01',
        alamat: 'Wayuhrejo, Pasuruhan, Mertoyudan, Magelang',
        kota: 'Magelang',
        namaKetua: 'PAK KAMID',
        namaSekretaris: 'Hendra Gunawan',
        namaBendahara: 'PAK IKUN',
        noHpKontak: '0812-3456-7890',
        emailKontak: 'kasrt01@gmail.com',
        tahunAktif: '2026',
        iuranDefault: 50000,
        jatuhTempoHari: 10,
        denda: 0,
        maksTenor: 12,
        landingMode: 'demo',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-10-01T08:00:00.000Z'
      };
    }

    seedDemoData() {
      ALL_COLLECTIONS.forEach(col => {
        this.cache[col] = [];
      });
      this.cache.settings = [this.getDefaultSettings()];
      this.cache.roles = JSON.parse(JSON.stringify(Constants.SYSTEM_ROLES));
      this.cache.categories = JSON.parse(JSON.stringify(Constants.DEFAULT_CATEGORIES));
      this.cache.inventoryCategories = JSON.parse(JSON.stringify(Constants.DEFAULT_INVENTORY_CATEGORIES));
      this.cache.inventoryItems = JSON.parse(JSON.stringify(Constants.DEFAULT_INVENTORY_ITEMS));
      this.cache.cashAccounts = [
        {
          id: 'ACC-001',
          nama: 'Kas Utama (Tunai di Bendahara)',
          keterangan: 'Uang kas fisik di brankas bendahara untuk pengeluaran cepat',
          saldoAwal: 3500000,
          saldoSaatIni: 4850000,
          status: 'Aktif',
          createdAt: '2026-01-01',
          updatedAt: '2026-10-01'
        },
        {
          id: 'ACC-002',
          nama: 'Bank BCA Kas RT (No. Rek 0123-8899-00)',
          keterangan: 'Rekening giro atas nama Kas RT 01 Harmoni',
          saldoAwal: 12500000,
          saldoSaatIni: 16750000,
          status: 'Aktif',
          createdAt: '2026-01-01',
          updatedAt: '2026-10-01'
        },
        {
          id: 'ACC-003',
          nama: 'Dana Darurat & Sosial (Bank Mandiri)',
          keterangan: 'Simpanan khusus dana abadi dan santunan warga',
          saldoAwal: 5000000,
          saldoSaatIni: 6200000,
          status: 'Aktif',
          createdAt: '2026-01-01',
          updatedAt: '2026-10-01'
        }
      ];

      this.cache.residents = [
        { id: 'WRG-0001', nama: 'Bambang Sutrisno', nik: '3308011205750001', noHp: '081234567890', alamat: 'Jl. Merpati Blok B No. 01', status: 'Aktif', catatan: 'Ketua RT 01 / Pemilik Tetap', createdAt: '2026-01-01' },
        { id: 'WRG-0002', nama: 'Siti Aminah', nik: '3308015508820002', noHp: '081298765432', alamat: 'Jl. Merpati Blok B No. 02', status: 'Aktif', catatan: 'Bendahara RT / Pemilik Tetap', createdAt: '2026-01-01' },
        { id: 'WRG-0003', nama: 'Hendra Gunawan', nik: '3308012403790003', noHp: '081311223344', alamat: 'Jl. Merpati Blok B No. 03', status: 'Aktif', catatan: 'Sekretaris RT / Pemilik Tetap', createdAt: '2026-01-01' },
        { id: 'WRG-0004', nama: 'Joko Widodo', nik: '3308011009800004', noHp: '081388990011', alamat: 'Jl. Merpati Blok B No. 04', status: 'Aktif', catatan: 'Koordinator Seksi Keamanan', createdAt: '2026-01-01' },
        { id: 'WRG-0005', nama: 'Budi Santoso', nik: '3308011506840005', noHp: '081566778899', alamat: 'Jl. Merpati Blok B No. 05', status: 'Aktif', catatan: 'Warga Tetap', createdAt: '2026-01-01' },
        { id: 'WRG-0006', nama: 'Ahmad Fauzi', nik: '3308011704880006', noHp: '081722334455', alamat: 'Jl. Merpati Blok B No. 06', status: 'Aktif', catatan: 'Warga Tetap / Petugas Inventaris', createdAt: '2026-01-01' },
        { id: 'WRG-0007', nama: 'Sri Wahyuni', nik: '3308016011810007', noHp: '081899001122', alamat: 'Jl. Merpati Blok B No. 07', status: 'Aktif', catatan: 'Warga Tetap / Koordinator Konsumsi', createdAt: '2026-01-01' },
        { id: 'WRG-0008', nama: 'Dewi Sartika', nik: '3308014502860008', noHp: '081922446688', alamat: 'Jl. Merpati Blok B No. 08', status: 'Aktif', catatan: 'Warga Tetap / Seksi Rohani', createdAt: '2026-01-01' },
        { id: 'WRG-0009', nama: 'Agus Salim', nik: '3308011808770009', noHp: '081233445566', alamat: 'Jl. Merpati Blok B No. 09', status: 'Aktif', catatan: 'Warga Tetap / Wiraswasta', createdAt: '2026-01-01' },
        { id: 'WRG-0010', nama: 'Rahmat Hidayat', nik: '3308012001850010', noHp: '081377889900', alamat: 'Jl. Merpati Blok B No. 10', status: 'Aktif', catatan: 'Warga Kontrak / Ada skema cicilan', createdAt: '2026-01-01' },
        { id: 'WRG-0011', nama: 'Eko Prasetyo', nik: '3308011407890011', noHp: '081644556677', alamat: 'Jl. Merpati Blok B No. 11', status: 'Aktif', catatan: 'Warga Tetap / Koordinator Pemuda', createdAt: '2026-01-01' },
        { id: 'WRG-0012', nama: 'Rudi Hartono', nik: '3308010803730012', noHp: '081855667788', alamat: 'Jl. Merpati Blok B No. 12', status: 'Aktif', catatan: 'Warga Tetap / Pensiunan', createdAt: '2026-01-01' }
      ];

      this.cache.users = [
        {
          id: 'USR-001',
          uid: 'usr_admin',
          nama: 'Bambang Sutrisno, S.T.',
          email: 'admin@kasrt.id',
          username: 'admin',
          password: 'demo123',
          noHp: '0812-3456-7890',
          jabatan: 'Ketua RT / Administrator',
          alamat: 'Jl. Merpati Blok B No. 01',
          bio: 'Pengabdi lingkungan RT 01 Harmoni periode 2024-2027.',
          avatarUrl: '',
          roles: ['Admin'],
          status: 'Aktif',
          residentId: 'WRG-0001',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-10-01T00:00:00.000Z'
        },
        {
          id: 'USR-002',
          uid: 'usr_bendahara',
          nama: 'Siti Aminah, S.E.',
          email: 'bendahara@kasrt.id',
          username: 'bendahara',
          password: 'demo123',
          noHp: '0812-9876-5432',
          jabatan: 'Bendahara Kas RT',
          alamat: 'Jl. Merpati Blok B No. 02',
          bio: 'Mengelola akuntansi dan pertanggungjawaban kas RT yang akuntabel.',
          avatarUrl: '',
          roles: ['Bendahara'],
          status: 'Aktif',
          residentId: 'WRG-0002',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-10-01T00:00:00.000Z'
        },
        {
          id: 'USR-003',
          uid: 'usr_sekretaris',
          nama: 'Hendra Gunawan',
          email: 'sekretaris@kasrt.id',
          username: 'sekretaris',
          password: 'demo123',
          noHp: '0813-1122-3344',
          jabatan: 'Sekretaris RT',
          alamat: 'Jl. Merpati Blok B No. 03',
          bio: 'Administrasi kependudukan dan surat-menyurat warga RT.',
          avatarUrl: '',
          roles: ['Sekretaris'],
          status: 'Aktif',
          residentId: 'WRG-0003',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-10-01T00:00:00.000Z'
        },
        {
          id: 'USR-004',
          uid: 'usr_inventaris',
          nama: 'Ahmad Fauzi',
          email: 'inventaris@kasrt.id',
          username: 'inventaris',
          password: 'demo123',
          noHp: '0817-2233-4455',
          jabatan: 'Koordinator Aset & Inventaris',
          alamat: 'Jl. Merpati Blok B No. 06',
          bio: 'Pemeliharaan dan jadwal cek fisik aset bersama RT.',
          avatarUrl: '',
          roles: ['PetugasInventaris'],
          status: 'Aktif',
          residentId: 'WRG-0006',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-10-01T00:00:00.000Z'
        },
        {
          id: 'USR-005',
          uid: 'usr_warga',
          nama: 'Budi Santoso',
          email: 'warga@kasrt.id',
          username: 'warga',
          password: 'demo123',
          noHp: '0815-6677-8899',
          jabatan: 'Warga RT 01',
          alamat: 'Jl. Merpati Blok B No. 05',
          bio: 'Warga aktif pendukung transparansi RT.',
          avatarUrl: '',
          roles: ['Warga'],
          status: 'Aktif',
          residentId: 'WRG-0005',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-10-01T00:00:00.000Z'
        }
      ];

      this.cache.duesTypes = [
        {
          id: 'DT-001',
          nama: 'Iuran Wajib Warga RT',
          nominal: 50000,
          deskripsi: 'Iuran bulanan kebersihan, sampah, keamanan, dan sosial',
          aktif: true,
          isDefault: true
        }
      ];

      const currentYear = 2026;
      const currentMonth = 10;
      const prevMonth = 9;
      this.cache.duesBills = [];
      this.cache.residents.forEach((r, idx) => {
        const isPaidPrev = idx !== 9;
        this.cache.duesBills.push({
          id: `BILL-${currentYear}09-${r.id}`,
          residentId: r.id,
          duesTypeId: 'DT-001',
          periodeBulan: prevMonth,
          periodeTahun: currentYear,
          nominal: 50000,
          status: isPaidPrev ? 'Lunas' : 'Belum',
          jumlahDibayar: isPaidPrev ? 50000 : 0,
          jatuhTempo: `${currentYear}-09-10`,
          createdAt: `${currentYear}-09-01T00:00:00.000Z`
        });

        const isPaidCur = idx < 7;
        this.cache.duesBills.push({
          id: `BILL-${currentYear}10-${r.id}`,
          residentId: r.id,
          duesTypeId: 'DT-001',
          periodeBulan: currentMonth,
          periodeTahun: currentYear,
          nominal: 50000,
          status: isPaidCur ? 'Lunas' : (idx === 9 ? 'Sebagian' : 'Belum'),
          jumlahDibayar: isPaidCur ? 50000 : (idx === 9 ? 25000 : 0),
          jatuhTempo: `${currentYear}-10-10`,
          createdAt: `${currentYear}-10-01T00:00:00.000Z`
        });
      });

      this.cache.duesPayments = [
        {
          id: 'PAY-202610-001',
          billId: 'BILL-202610-WRG-0001',
          residentId: 'WRG-0001',
          tanggalBayar: '2026-10-02',
          jumlah: 50000,
          metode: 'Transfer',
          status: 'Terverifikasi',
          verifiedBy: 'Siti Aminah',
          verifiedAt: '2026-10-02T09:00:00.000Z',
          transactionId: 'TRX-0001',
          mode: 'Penuh',
          createdAt: '2026-10-02T08:30:00.000Z'
        },
        {
          id: 'PAY-202610-002',
          billId: 'BILL-202610-WRG-0002',
          residentId: 'WRG-0002',
          tanggalBayar: '2026-10-02',
          jumlah: 50000,
          metode: 'Tunai',
          status: 'Terverifikasi',
          verifiedBy: 'Siti Aminah',
          verifiedAt: '2026-10-02T09:05:00.000Z',
          transactionId: 'TRX-0002',
          mode: 'Penuh',
          createdAt: '2026-10-02T09:00:00.000Z'
        },
        {
          id: 'PAY-202610-003',
          billId: 'BILL-202610-WRG-0005',
          residentId: 'WRG-0005',
          tanggalBayar: '2026-10-05',
          jumlah: 50000,
          metode: 'QRIS',
          status: 'Terverifikasi',
          verifiedBy: 'Siti Aminah',
          verifiedAt: '2026-10-05T11:00:00.000Z',
          transactionId: 'TRX-0003',
          mode: 'Penuh',
          createdAt: '2026-10-05T10:45:00.000Z'
        }
      ];

      this.cache.installmentPlans = [
        {
          id: 'PLN-2026-001',
          residentId: 'WRG-0010',
          totalPokok: 300000,
          dp: 50000,
          jumlahTermin: 5,
          frekuensi: 'bulanan',
          tanggalMulai: '2026-09-01',
          status: 'Aktif',
          alasan: 'Penyelesaian tunggakan iuran semester lalu karena pemulihan usaha',
          requestedBy: 'Rahmat Hidayat',
          requestedAt: '2026-08-28T10:00:00.000Z',
          approvedBy: 'Bambang Sutrisno',
          approvedAt: '2026-08-29T14:00:00.000Z',
          totalDibayar: 110000,
          createdAt: '2026-08-28T10:00:00.000Z',
          updatedAt: '2026-10-05T10:00:00.000Z'
        }
      ];

      this.cache.installmentSchedules = [
        { id: 'SCH-PLN-001-01', planId: 'PLN-2026-001', terminKe: 1, tanggalJatuhTempo: '2026-09-10', nominal: 50000, kumulatif: 50000, status: 'Lunas', lunasAt: '2026-09-08' },
        { id: 'SCH-PLN-001-02', planId: 'PLN-2026-001', terminKe: 2, tanggalJatuhTempo: '2026-10-10', nominal: 50000, kumulatif: 100000, status: 'Sebagian', lunasAt: null },
        { id: 'SCH-PLN-001-03', planId: 'PLN-2026-001', terminKe: 3, tanggalJatuhTempo: '2026-11-10', nominal: 50000, kumulatif: 150000, status: 'Belum Jatuh Tempo', lunasAt: null },
        { id: 'SCH-PLN-001-04', planId: 'PLN-2026-001', terminKe: 4, tanggalJatuhTempo: '2026-12-10', nominal: 50000, kumulatif: 200000, status: 'Belum Jatuh Tempo', lunasAt: null },
        { id: 'SCH-PLN-001-05', planId: 'PLN-2026-001', terminKe: 5, tanggalJatuhTempo: '2027-01-10', nominal: 50000, kumulatif: 250000, status: 'Belum Jatuh Tempo', lunasAt: null }
      ];

      this.cache.paymentAllocations = [
        { id: 'ALC-001', paymentId: 'PAY-DP-001', billId: null, scheduleId: 'SCH-PLN-001-01', planId: 'PLN-2026-001', jumlah: 50000, status: 'Aktif', createdAt: '2026-09-08T10:00:00.000Z' },
        { id: 'ALC-002', paymentId: 'PAY-DP-002', billId: null, scheduleId: 'SCH-PLN-001-02', planId: 'PLN-2026-001', jumlah: 10000, status: 'Aktif', createdAt: '2026-10-05T10:00:00.000Z' }
      ];

      this.cache.transactions = [
        {
          id: 'TRX-0001',
          tanggal: '2026-10-02',
          tipe: 'Pemasukan',
          cashAccountId: 'ACC-002',
          categoryId: 'CAT-IN-001',
          categoryNameSnapshot: 'Iuran Warga',
          subKategori: 'Iuran Wajib Bulanan',
          jumlah: 50000,
          keterangan: 'Iuran Oktober warga Bambang Sutrisno',
          metode: 'Transfer',
          buktiUrl: '',
          status: 'Final',
          source: 'DuesPayment',
          residentId: 'WRG-0001',
          sumberDana: { tipe: 'warga', label: 'Warga Pembayar', nama: 'Bambang Sutrisno', residentId: 'WRG-0001' },
          createdBy: 'Siti Aminah',
          createdAt: '2026-10-02T09:00:00.000Z'
        },
        {
          id: 'TRX-0002',
          tanggal: '2026-10-02',
          tipe: 'Pemasukan',
          cashAccountId: 'ACC-001',
          categoryId: 'CAT-IN-001',
          categoryNameSnapshot: 'Iuran Warga',
          subKategori: 'Iuran Wajib Bulanan',
          jumlah: 50000,
          keterangan: 'Iuran Oktober warga Siti Aminah',
          metode: 'Tunai',
          buktiUrl: '',
          status: 'Final',
          source: 'DuesPayment',
          residentId: 'WRG-0002',
          sumberDana: { tipe: 'warga', label: 'Warga Pembayar', nama: 'Siti Aminah', residentId: 'WRG-0002' },
          createdBy: 'Siti Aminah',
          createdAt: '2026-10-02T09:05:00.000Z'
        },
        {
          id: 'TRX-0003',
          tanggal: '2026-10-03',
          tipe: 'Pengeluaran',
          cashAccountId: 'ACC-001',
          categoryId: 'CAT-OUT-002',
          categoryNameSnapshot: 'Kebersihan & Sampah',
          subKategori: 'Honor Petugas Sampah',
          jumlah: 450000,
          keterangan: 'Honor pengangkutan sampah minggu I Oktober & karung sampah',
          metode: 'Tunai',
          buktiUrl: '',
          status: 'Final',
          source: 'Manual',
          sumberDana: { tipe: 'bebas', label: 'Petugas Sampah', nama: 'Pak Sukirno' },
          createdBy: 'Siti Aminah',
          createdAt: '2026-10-03T14:30:00.000Z'
        },
        {
          id: 'TRX-0004',
          tanggal: '2026-10-04',
          tipe: 'Pengeluaran',
          cashAccountId: 'ACC-001',
          categoryId: 'CAT-OUT-003',
          categoryNameSnapshot: 'Keamanan & Ronda',
          subKategori: 'Kopi/Gula Pos Ronda',
          jumlah: 150000,
          keterangan: 'Pengadaan kopi, gula, teh, dan mie instan pos ronda',
          metode: 'Tunai',
          buktiUrl: '',
          status: 'Final',
          source: 'Manual',
          sumberDana: { tipe: 'bebas', label: 'Koordinator Keamanan', nama: 'Joko Widodo' },
          createdBy: 'Siti Aminah',
          createdAt: '2026-10-04T19:00:00.000Z'
        },
        {
          id: 'TRX-0005',
          tanggal: '2026-10-05',
          tipe: 'Pemasukan',
          cashAccountId: 'ACC-002',
          categoryId: 'CAT-IN-002',
          categoryNameSnapshot: 'Sumbangan Warga',
          subKategori: 'Sumbangan Pos Ronda',
          jumlah: 500000,
          keterangan: 'Sumbangan sukarela perbaikan lampu pos ronda dari H. Budi',
          metode: 'Transfer',
          buktiUrl: '',
          status: 'Final',
          source: 'Manual',
          residentId: 'WRG-0005',
          sumberDana: { tipe: 'warga', label: 'Nama Penyumbang', nama: 'Budi Santoso', residentId: 'WRG-0005' },
          createdBy: 'Siti Aminah',
          createdAt: '2026-10-05T10:15:00.000Z'
        },
        {
          id: 'TRX-0006',
          tanggal: '2026-10-06',
          tipe: 'Pengeluaran',
          cashAccountId: 'ACC-002',
          categoryId: 'CAT-OUT-001',
          categoryNameSnapshot: 'Operasional RT',
          subKategori: 'Token Listrik Balai',
          jumlah: 200000,
          keterangan: 'Pembelian token listrik PLN balai pertemuan RT 01',
          metode: 'Transfer',
          buktiUrl: '',
          status: 'Final',
          source: 'Manual',
          sumberDana: { tipe: 'entitas', label: 'Penerima / Vendor', nama: 'PLN Mobile' },
          createdBy: 'Siti Aminah',
          createdAt: '2026-10-06T11:20:00.000Z'
        }
      ];

      this.cache.inventoryOfficers = [
        {
          id: 'INV-OFF-001',
          residentId: 'WRG-0006',
          nama: 'Ahmad Fauzi',
          noHp: '0817-2233-4455',
          alamat: 'Jl. Merpati Blok B No. 06',
          jabatan: 'Koordinator Perlengkapan',
          periodeMulai: '2026-01-01',
          periodeSelesai: '2026-12-31',
          status: 'Aktif',
          catatan: 'Penanggung jawab gudang utama',
          createdAt: '2026-01-01'
        },
        {
          id: 'INV-OFF-002',
          residentId: 'WRG-0011',
          nama: 'Eko Prasetyo',
          noHp: '0816-4455-6677',
          alamat: 'Jl. Merpati Blok B No. 11',
          jabatan: 'Anggota Tim Aset',
          periodeMulai: '2026-01-01',
          periodeSelesai: '2026-12-31',
          status: 'Aktif',
          catatan: 'Petugas lapangan',
          createdAt: '2026-01-01'
        }
      ];

      this.cache.inventoryGroups = [
        {
          id: 'INV-GRP-001',
          nama: 'Tim Merpati Rajawali',
          icon: 'group',
          warna: '#4f46e5',
          deskripsi: 'Tim pemeriksa aset blok B dan pos ronda barat',
          ketuaId: 'INV-OFF-001',
          memberIds: ['INV-OFF-001', 'INV-OFF-002'],
          status: 'Aktif',
          periodeMulai: '2026-01-01',
          periodeSelesai: '2026-12-31',
          createdAt: '2026-01-01'
        }
      ];

      this.cache.inventorySchedules = [
        {
          id: 'INV-SCH-001',
          judul: 'Pemeriksaan Rutin Triwulan IV Aset Balai',
          frekuensi: 'triwulan',
          hariPengecekan: 'Sabtu',
          tanggalPengecekan: '2026-10-17',
          intervalHari: 90,
          tanggalMulai: '2026-10-01',
          groupId: 'INV-GRP-001',
          groupNama: 'Tim Merpati Rajawali',
          petugasIds: ['INV-OFF-001', 'INV-OFF-002'],
          status: 'Menunggu',
          catatan: 'Fokus cek sound system dan alat tenda untuk persiapan PHBN',
          createdAt: '2026-10-01'
        }
      ];

      this.cache.auditLogs = [
        {
          id: 'AUD-202610-001',
          userId: 'usr_admin',
          userName: 'Bambang Sutrisno, S.T.',
          aksi: 'SISTEM_BOOTSTRAP',
          collection: 'settings',
          recordId: 'global',
          dataLama: null,
          dataBaru: { status: 'Database diinisialisasi dengan data demo RT 01 Harmoni' },
          timestamp: '2026-10-01T08:00:00.000Z',
          metadata: { ua: 'KasRT Core Initializer' }
        },
        {
          id: 'AUD-202610-002',
          userId: 'usr_bendahara',
          userName: 'Siti Aminah, S.E.',
          aksi: 'CREATE_TRANSACTION',
          collection: 'transactions',
          recordId: 'TRX-0001',
          dataLama: null,
          dataBaru: { tipe: 'Pemasukan', jumlah: 50000, keterangan: 'Iuran warga Bambang Sutrisno' },
          timestamp: '2026-10-02T09:00:00.000Z',
          metadata: { ua: 'KasRT Web Client' }
        }
      ];

      this.cache.notifications = [
        {
          id: 'NTF-001',
          judul: 'Selamat Datang di KasRT!',
          pesan: 'Aplikasi pembukuan dan administrasi modern RT 01 Harmoni aktif.',
          tipe: 'info',
          dibaca: false,
          createdAt: '2026-10-01T08:00:00.000Z'
        },
        {
          id: 'NTF-002',
          judul: 'Jadwal Pengecekan Fisik Inventaris',
          pesan: 'Pengecekan aset Balai dijadwalkan pada hari Sabtu, 17 Oktober 2026.',
          tipe: 'warning',
          dibaca: false,
          createdAt: '2026-10-05T09:00:00.000Z'
        }
      ];

      this.cache.systemActivityLogs = [
        {
          id: 'LOG-001',
          timestamp: '2026-10-01T08:00:00.000Z',
          level: 'SUCCESS',
          type: 'SYSTEM_BOOT',
          message: 'Basis data sistem KasRT diinisialisasi dengan 31 tabel koleksi',
          source: 'StorageEngine',
          details: { collections: ALL_COLLECTIONS.length }
        },
        {
          id: 'LOG-002',
          timestamp: '2026-10-01T08:01:00.000Z',
          level: 'INFO',
          type: 'HEALTH_CHECK',
          message: 'Konektivitas penyimpanan lokal terverifikasi normal',
          source: 'HealthMonitor',
          details: { status: 'ONLINE' }
        }
      ];

      this.persistDemo();
    }

    clearAllDemoData() {
      // Menghapus data transaksi, tagihan, cicilan, inventaris, dan audit,
      // namun mempertahankan struktur settings, role, akun kas kosong, dan kategori dasar
      const currentSettings = this.cache.settings && this.cache.settings.length > 0
        ? this.cache.settings
        : [this.getDefaultSettings()];
      const currentRoles = this.cache.roles && this.cache.roles.length > 0
        ? this.cache.roles
        : JSON.parse(JSON.stringify(Constants.SYSTEM_ROLES));
      const currentCategories = this.cache.categories && this.cache.categories.length > 0
        ? this.cache.categories
        : JSON.parse(JSON.stringify(Constants.DEFAULT_CATEGORIES));

      // Reset semua saldo akun kas ke 0
      const cleanAccounts = (this.cache.cashAccounts && this.cache.cashAccounts.length > 0
        ? this.cache.cashAccounts
        : [
            { id: 'ACC-001', nama: 'Kas Utama Tunai', keterangan: 'Brankas kas fisik', saldoAwal: 0, saldoSaatIni: 0, status: 'Aktif' },
            { id: 'ACC-002', nama: 'Bank BCA Kas RT', keterangan: 'Rekening bank operasional', saldoAwal: 0, saldoSaatIni: 0, status: 'Aktif' }
          ]
      ).map(a => ({ ...a, saldoAwal: 0, saldoSaatIni: 0 }));

      // Kosongkan seluruh koleksi transaksional
      ALL_COLLECTIONS.forEach(col => {
        this.cache[col] = [];
      });

      this.cache.settings = currentSettings;
      this.cache.roles = currentRoles;
      this.cache.categories = currentCategories;
      this.cache.cashAccounts = cleanAccounts;
      this.persistDemo();

      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('db:cleared', { timestamp: Utils.nowISO() });
      }
      return true;
    }

    reloadDemoData() {
      this.seedDemoData();
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('db:seeded', { timestamp: Utils.nowISO() });
      }
      return true;
    }

    get(col, id) {
      if (!this.cache[col]) return null;
      return this.cache[col].find(item => item && item.id === id) || null;
    }

    list(col) {
      if (!this.cache[col]) return [];
      return [...this.cache[col]];
    }

    async set(col, doc, opts = {}) {
      if (!this.cache[col]) this.cache[col] = [];
      const index = this.cache[col].findIndex(item => item && item.id === doc.id);
      const toSave = { ...doc, updatedAt: Utils.nowISO() };
      if (index >= 0) {
        this.cache[col][index] = toSave;
      } else {
        toSave.createdAt = toSave.createdAt || Utils.nowISO();
        if (Constants.PREPEND_COLS.has(col)) {
          this.cache[col].unshift(toSave);
        } else {
          this.cache[col].push(toSave);
        }
      }
      this.persistDemo();

      if (this.mode === 'firebase' && window.firebase && window.firebase.firestore) {
        if (window.firebase.auth && !window.firebase.auth().currentUser && window.KasRT && window.KasRT.Auth && window.KasRT.Auth.ensureFirebaseAuth) {
          window.KasRT.Auth.ensureFirebaseAuth().catch(() => {});
        }
        const cleanPayload = JSON.parse(JSON.stringify(toSave));
        Promise.race([
          window.firebase.firestore().collection(col).doc(String(doc.id)).set(cleanPayload, { merge: true }),
          new Promise((_, r) => setTimeout(() => r(new Error('Firebase set timeout')), 2500))
        ]).catch(e => console.warn(`[KasRT DB] Firebase set on ${col}/${doc.id}:`, e));
      }

      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit(`db:${col}:changed`, { action: index >= 0 ? 'update' : 'create', doc: toSave });
      }
      return toSave;
    }

    async update(col, id, patch = {}) {
      const existing = this.get(col, id);
      if (!existing) {
        throw new Error(`Dokumen "${id}" di koleksi "${col}" tidak ditemukan.`);
      }
      const updated = { ...existing, ...patch, updatedAt: Utils.nowISO() };
      return this.set(col, updated);
    }

    async remove(col, id) {
      if (!this.cache[col]) return false;
      const index = this.cache[col].findIndex(item => item && item.id === id);
      if (index === -1) return false;
      const removed = this.cache[col].splice(index, 1)[0];
      this.persistDemo();

      if (this.mode === 'firebase' && window.firebase && window.firebase.firestore) {
        Promise.race([
          window.firebase.firestore().collection(col).doc(id).delete(),
          new Promise((_, r) => setTimeout(() => r(new Error('Firebase delete timeout')), 2500))
        ]).catch(e => console.warn(`[KasRT DB] Firebase delete on ${col}/${id}:`, e));
      }

      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit(`db:${col}:changed`, { action: 'delete', id, removed });
      }
      return true;
    }

    async removeCollection(col, ids = []) {
      const idSet = new Set(ids);
      if (!this.cache[col]) return 0;
      const initialCount = this.cache[col].length;
      this.cache[col] = this.cache[col].filter(item => !idSet.has(item.id));
      const deletedCount = initialCount - this.cache[col].length;
      this.persistDemo();

      if (this.mode === 'firebase' && window.firebase && window.firebase.firestore) {
        try {
          const batch = window.firebase.firestore().batch();
          ids.forEach(id => {
            const ref = window.firebase.firestore().collection(col).doc(id);
            batch.delete(ref);
          });
          await batch.commit();
        } catch (e) {
          console.warn(`[KasRT DB] Firebase batch delete error:`, e);
        }
      }
      return deletedCount;
    }

    async resetCollection(col) {
      if (!this.cache[col]) return;
      this.cache[col] = [];
      this.persistDemo();
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit(`db:${col}:changed`, { action: 'reset' });
      }
    }

    async log(userId, aksi, collection, recordId, dataLama = null, dataBaru = null) {
      const id = Utils.nextId('AUD', this.cache.auditLogs || []);
      const user = this.get('users', userId) || { nama: 'Pengguna' };
      const entry = {
        id,
        userId,
        userName: user.nama || 'Sistem',
        aksi,
        collection,
        recordId,
        dataLama,
        dataBaru,
        timestamp: Utils.nowISO(),
        metadata: {
          ua: navigator.userAgent || 'Web Browser',
          url: window.location.hash
        }
      };
      if (!this.cache.auditLogs) this.cache.auditLogs = [];
      this.cache.auditLogs.unshift(entry);
      this.persistDemo();

      if (this.mode === 'firebase' && window.firebase && window.firebase.firestore) {
        try {
          const cleanEntry = JSON.parse(JSON.stringify(entry));
          await window.firebase.firestore().collection('auditLogs').doc(id).set(cleanEntry);
        } catch (e) {
          console.warn('[KasRT DB] Failed to save audit log to Firebase:', e);
        }
      }
      return entry;
    }

    nextId(prefix, col) {
      const arr = this.cache[col] || [];
      return Utils.nextId(prefix, arr);
    }
  }

  class StorageAdapter {
    static async upload(file, pathPrefix = 'bukti') {
      if (!file) throw new Error('File tidak dipilih');
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error('Ukuran file melebihi batas maksimal 5MB.');
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Format file harus berupa Gambar (JPEG, PNG, WebP) atau Dokumen PDF.');
      }

      if (window.firebase && window.firebase.storage && FirebaseConfig.FIREBASE_ENABLED) {
        try {
          const storageRef = window.firebase.storage().ref();
          const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
          const fileRef = storageRef.child(`${pathPrefix}/${cleanName}`);
          const snapshot = await fileRef.put(file);
          const downloadUrl = await snapshot.ref.getDownloadURL();
          return { url: downloadUrl, name: file.name, size: file.size, type: file.type };
        } catch (e) {
          console.warn('[KasRT Storage] Cloud upload failed, falling back to Base64:', e);
        }
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            url: reader.result,
            name: file.name,
            size: file.size,
            type: file.type
          });
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    }
  }

  class IdempotencyAdapter {
    static gen(prefix = 'IDEM') {
      const randomStr = Math.random().toString(36).substring(2, 10);
      return `${prefix}_${Date.now()}_${randomStr}`;
    }

    static check(key, collectionName) {
      if (!key) return null;
      const list = window.KasRT.DB.list(collectionName);
      return list.find(item => item && (item.idempotencyKey === key || item.idemKey === key)) || null;
    }
  }

  const dbInstance = new DatabaseAdapter();
  window.KasRT = window.KasRT || {};
  window.KasRT.DB = dbInstance;
  window.KasRT.Storage = StorageAdapter;
  window.KasRT.Idem = IdempotencyAdapter;
  window.KasRT_DB_Loaded = true;
})();
