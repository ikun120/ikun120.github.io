/**
 * KasRT - Core Constants
 * Kategori default, aksen & gradien tema, inventaris seed, role sistem, dan storage keys
 */
(function() {
  'use strict';
  if (window.KasRT_Constants_Loaded) return;

  const LS_KEY = 'kasrt_v7_demo';
  const LS_SESSION = 'kasrt_session_v7';
  const LS_THEME = 'kasrt_theme_mode';
  const LS_ACCENT = 'kasrt_theme_accent';
  const LS_GRADIENT = 'kasrt_theme_gradient';
  const LS_DB_SYNC = 'kasrt_db_last_sync';
  const LS_ACTIVITY_LOGS = 'kasrt_system_activity_logs';

  const ACCENTS = {
    royal: {
      id: 'royal',
      name: 'Biru Royal (Default)',
      primary: '37 99 235',
      container: '219 234 254',
      fixed: '#2563eb',
      hex: '#2563eb'
    },
    iris: {
      id: 'iris',
      name: 'Iris Violet',
      primary: '124 58 237',
      container: '237 233 254',
      fixed: '#7c3aed',
      hex: '#5b21b6'
    },
    ember: {
      id: 'ember',
      name: 'Ember Nyala',
      primary: '234 88 12',
      container: '255 237 213',
      fixed: '#ea580c',
      hex: '#c2410c'
    },
    sage: {
      id: 'sage',
      name: 'Sage Botani',
      primary: '21 128 61',
      container: '220 252 231',
      fixed: '#15803d',
      hex: '#166534'
    },
    cobalt: {
      id: 'cobalt',
      name: 'Kobalt Elektrik',
      primary: '29 78 216',
      container: '219 234 254',
      fixed: '#1d4ed8',
      hex: '#1e3a8a'
    },
    indigo: {
      id: 'indigo',
      name: 'Harmoni Indigo',
      primary: '79 70 229',
      container: '224 231 255',
      fixed: '#4f46e5',
      hex: '#4f46e5'
    },
    emerald: {
      id: 'emerald',
      name: 'Rindang Emerald',
      primary: '16 185 129',
      container: '209 250 229',
      fixed: '#10b981',
      hex: '#10b981'
    },
    rose: {
      id: 'rose',
      name: 'Hangat Rose',
      primary: '244 63 94',
      container: '255 228 230',
      fixed: '#f43f5e',
      hex: '#f43f5e'
    },
    violet: {
      id: 'violet',
      name: 'Wibawa Violet',
      primary: '124 58 237',
      container: '237 233 254',
      fixed: '#7c3aed',
      hex: '#7c3aed'
    },
    sky: {
      id: 'sky',
      name: 'Sejuk Sky',
      primary: '14 165 233',
      container: '224 242 254',
      fixed: '#0ea5e9',
      hex: '#0ea5e9'
    },
    amber: {
      id: 'amber',
      name: 'Hangat Amber',
      primary: '217 119 6',
      container: '254 243 199',
      fixed: '#d97706',
      hex: '#d97706'
    },
    slate: {
      id: 'slate',
      name: 'Kokoh Slate',
      primary: '71 85 105',
      container: '241 245 249',
      fixed: '#475569',
      hex: '#475569'
    },
    orchid: {
      id: 'orchid',
      name: 'Pesona Anggrek',
      primary: '168 85 247',
      container: '243 232 255',
      fixed: '#a855f7',
      hex: '#a855f7'
    }
  };

  const GRADIENTS = {
    'default': {
      id: 'default',
      name: 'Biru Royal (Default)',
      badge: 'Bawaan',
      start: '#1d4ed8',
      via: '#2563eb',
      end: '#3b82f6',
      accentKey: 'royal',
      preview: 'from-blue-700 via-blue-600 to-blue-500',
      description: 'Palet biru royal esensial yang tegas, jernih, dan profesional',
      swatches: ['#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#93c5fd']
    },
    'iris': {
      id: 'iris',
      name: 'Iris Violet Artistik',
      badge: 'Artistik',
      start: '#5b21b6',
      via: '#7c3aed',
      end: '#a855f7',
      accentKey: 'iris',
      preview: 'from-violet-800 via-violet-600 to-purple-500',
      description: 'Palet iris ungu-violet yang memukau, elegan, dan berkarakter kuat',
      swatches: ['#4c1d95', '#5b21b6', '#7c3aed', '#8b5cf6', '#c4b5fd']
    },
    'ember': {
      id: 'ember',
      name: 'Bara Api & Emas (Ember)',
      badge: 'Hangat',
      start: '#c2410c',
      via: '#ea580c',
      end: '#f59e0b',
      accentKey: 'ember',
      preview: 'from-orange-700 via-orange-600 to-amber-500',
      description: 'Palet bara api hangat dan emas yang energik, ramah, dan memikat',
      swatches: ['#9a3412', '#c2410c', '#ea580c', '#f97316', '#fdba74']
    },
    'sage': {
      id: 'sage',
      name: 'Botani Sage & Forest',
      badge: 'Alami',
      start: '#166534',
      via: '#15803d',
      end: '#65a30d',
      accentKey: 'sage',
      preview: 'from-green-800 via-green-700 to-lime-600',
      description: 'Palet sage botani alami yang menenangkan, sejuk, dan harmonis',
      swatches: ['#14532d', '#166534', '#15803d', '#22c55e', '#86efac']
    },
    'cobalt': {
      id: 'cobalt',
      name: 'Biru Kobalt Elektrik',
      badge: 'Elektrik',
      start: '#1e3a8a',
      via: '#1d4ed8',
      end: '#0284c7',
      accentKey: 'cobalt',
      preview: 'from-blue-900 via-blue-700 to-sky-600',
      description: 'Palet biru kobalt elektrik tajam berwibawa dengan kontras tinggi',
      swatches: ['#172554', '#1e3a8a', '#1d4ed8', '#0284c7', '#38bdf8']
    },
    'orchid': {
      id: 'orchid',
      name: 'Pesona Anggrek & Lavender',
      badge: 'Pastel',
      start: '#4f46e5',
      via: '#9333ea',
      end: '#ec4899',
      accentKey: 'orchid',
      preview: 'from-indigo-600 via-purple-600 to-pink-500',
      description: 'Gradien lembut menawan berpadu indigo, anggrek ungu, dan mawar cerah',
      swatches: ['#3730a3', '#4f46e5', '#9333ea', '#c084fc', '#f472b6']
    },
    'indigo-violet': {
      id: 'indigo-violet',
      name: 'Harmoni Indigo & Violet',
      badge: 'Klasik',
      start: '#4f46e5',
      via: '#6366f1',
      end: '#7c3aed',
      accentKey: 'indigo',
      preview: 'from-indigo-600 via-indigo-500 to-purple-600',
      description: 'Gradien klasik elegan untuk kesan profesional dan terpercaya',
      swatches: ['#3730a3', '#4f46e5', '#6366f1', '#7c3aed', '#a78bfa']
    },
    'emerald-teal': {
      id: 'emerald-teal',
      name: 'Zamrud & Pirus Tropis',
      badge: 'Tropis',
      start: '#059669',
      via: '#10b981',
      end: '#0d9488',
      accentKey: 'emerald',
      preview: 'from-emerald-600 via-teal-500 to-cyan-600',
      description: 'Gradien hijau menyejukkan lingkungan RT guyub rukun',
      swatches: ['#065f46', '#059669', '#10b981', '#0d9488', '#2dd4bf']
    },
    'ocean-blue': {
      id: 'ocean-blue',
      name: 'Samudra Azure Modern',
      badge: 'Segar',
      start: '#0284c7',
      via: '#0ea5e9',
      end: '#4338ca',
      accentKey: 'sky',
      preview: 'from-sky-600 via-blue-500 to-indigo-700',
      description: 'Gradien biru modern dengan kontras tinggi dan cerah',
      swatches: ['#075985', '#0284c7', '#0ea5e9', '#3b82f6', '#4338ca']
    },
    'sunset-rose': {
      id: 'sunset-rose',
      name: 'Lembayung Sunset & Rose',
      badge: 'Ceria',
      start: '#e11d48',
      via: '#f43f5e',
      end: '#f59e0b',
      accentKey: 'rose',
      preview: 'from-rose-600 via-pink-500 to-amber-500',
      description: 'Gradien hangat ceria penuh semangat gotong royong',
      swatches: ['#9f1239', '#e11d48', '#f43f5e', '#fb7185', '#f59e0b']
    },
    'aurora-neon': {
      id: 'aurora-neon',
      name: 'Aurora Cyber Neon',
      badge: 'Futuristik',
      start: '#10b981',
      via: '#06b6d4',
      end: '#8b5cf6',
      accentKey: 'emerald',
      preview: 'from-emerald-500 via-cyan-500 to-violet-600',
      description: 'Gradien futuristik dengan nuansa modern dan visual mewah',
      swatches: ['#059669', '#10b981', '#06b6d4', '#8b5cf6', '#d946ef']
    },
    'obsidian-gold': {
      id: 'obsidian-gold',
      name: 'Obsidian Emas Mewah',
      badge: 'Mewah',
      start: '#334155',
      via: '#475569',
      end: '#d97706',
      accentKey: 'amber',
      preview: 'from-slate-700 via-slate-600 to-amber-600',
      description: 'Gradien temaram berkelas dengan aksen emas yang tajam',
      swatches: ['#0f172a', '#334155', '#475569', '#b45309', '#f59e0b']
    }
  };

  const DEFAULT_CATEGORIES = [
    {
      id: 'CAT-IN-001',
      nama: 'Iuran Warga',
      tipe: 'Pemasukan',
      deskripsi: 'Iuran rutin bulanan warga RT/RW untuk pengelolaan lingkungan',
      warna: '#10b981',
      icon: 'savings',
      subItems: ['Iuran Wajib Bulanan', 'Iuran Sampah', 'Iuran Keamanan'],
      membutuhkanPihak: true,
      jenisPihak: 'warga',
      pihakLabel: 'Warga Pembayar',
      aktif: true,
      isDefault: true,
      usageCount: 0
    },
    {
      id: 'CAT-IN-002',
      nama: 'Sumbangan Warga',
      tipe: 'Pemasukan',
      deskripsi: 'Sumbangan sukarela warga untuk kegiatan bersama atau kas insidental',
      warna: '#0ea5e9',
      icon: 'volunteer_activism',
      subItems: ['Sumbangan PHBN/17-an', 'Sumbangan Pos Ronda', 'Sumbangan Kerja Bakti'],
      membutuhkanPihak: true,
      jenisPihak: 'warga',
      pihakLabel: 'Nama Penyumbang',
      aktif: true,
      isDefault: true,
      usageCount: 0
    },
    {
      id: 'CAT-IN-003',
      nama: 'Donasi & CSR',
      tipe: 'Pemasukan',
      deskripsi: 'Bantuan dari lembaga, sponsor, perusahaan, atau donatur luar RT',
      warna: '#6366f1',
      icon: 'handshake',
      subItems: ['Bantuan Kelurahan/Desa', 'Sponsor Perusahaan', 'Donatur Pribadi Luar'],
      membutuhkanPihak: true,
      jenisPihak: 'entitas',
      pihakLabel: 'Lembaga / Donatur',
      aktif: true,
      isDefault: true,
      usageCount: 0
    },
    {
      id: 'CAT-IN-004',
      nama: 'Bunga Bank',
      tipe: 'Pemasukan',
      deskripsi: 'Bagi hasil atau bunga simpanan rekening bank kas RT',
      warna: '#14b8a6',
      icon: 'account_balance',
      subItems: ['Bagi Hasil Syariah', 'Bunga Tabungan'],
      membutuhkanPihak: true,
      jenisPihak: 'entitas',
      pihakLabel: 'Nama Bank',
      aktif: true,
      isDefault: true,
      usageCount: 0
    },
    {
      id: 'CAT-IN-005',
      nama: 'Lain-lain (Masuk)',
      tipe: 'Pemasukan',
      deskripsi: 'Pemasukan sah lainnya yang belum terklasifikasi khusus',
      warna: '#8b5cf6',
      icon: 'add_circle',
      subItems: ['Sewa Tenda & Kursi RT', 'Penjualan Barang Bekas/Rosok', 'Denda Keterlambatan'],
      membutuhkanPihak: false,
      jenisPihak: 'bebas',
      pihakLabel: 'Pihak Terkait',
      aktif: true,
      isDefault: true,
      usageCount: 0
    },
    {
      id: 'CAT-OUT-001',
      nama: 'Operasional RT',
      tipe: 'Pengeluaran',
      deskripsi: 'Biaya kesekretariatan, ATK, konsumsi rapat, dan listrik fasilitas umum',
      warna: '#f43f5e',
      icon: 'receipt_long',
      subItems: ['ATK & Foto Copy', 'Konsumsi Pertemuan Rutin', 'Pulsa/Paket Data RT', 'Token Listrik Balai'],
      membutuhkanPihak: true,
      jenisPihak: 'entitas',
      pihakLabel: 'Penerima / Vendor',
      aktif: true,
      isDefault: true,
      usageCount: 0
    },
    {
      id: 'CAT-OUT-002',
      nama: 'Kebersihan & Sampah',
      tipe: 'Pengeluaran',
      deskripsi: 'Honor petugas pengangkut sampah, alat kebersihan, dan pemeliharaan TPA',
      warna: '#e11d48',
      icon: 'delete_sweep',
      subItems: ['Honor Petugas Sampah', 'Pengadaan Tong & Plastik', 'Pembersihan Saluran Air'],
      membutuhkanPihak: true,
      jenisPihak: 'bebas',
      pihakLabel: 'Petugas / Petugas Sampah',
      aktif: true,
      isDefault: true,
      usageCount: 0
    },
    {
      id: 'CAT-OUT-003',
      nama: 'Keamanan & Ronda',
      tipe: 'Pengeluaran',
      deskripsi: 'Insentif petugas keamanan, konsumsi ronda malam, dan perlengkapan poskamling',
      warna: '#d97706',
      icon: 'local_police',
      subItems: ['Honor Satpam/Waker', 'Kopi/Gula Pos Ronda', 'Baterai Senter & Kentongan'],
      membutuhkanPihak: true,
      jenisPihak: 'bebas',
      pihakLabel: 'Koordinator Keamanan',
      aktif: true,
      isDefault: true,
      usageCount: 0
    },
    {
      id: 'CAT-OUT-004',
      nama: 'Sosial & Duka Cita',
      tipe: 'Pengeluaran',
      deskripsi: 'Santunan duka cita warga, bantuan sakit/rawat inap, dan bingkisan melahirkan',
      warna: '#ec4899',
      icon: 'favorite',
      subItems: ['Santunan Meninggal Dunia', 'Besuk Warga Sakit', 'Kelahiran Bayi'],
      membutuhkanPihak: true,
      jenisPihak: 'warga',
      pihakLabel: 'Warga Penerima',
      aktif: true,
      isDefault: true,
      usageCount: 0
    },
    {
      id: 'CAT-OUT-005',
      nama: 'Pembangunan & Fasum',
      tipe: 'Pengeluaran',
      deskripsi: 'Perbaikan jalan, paving, pengecatan gapura, dan perawatan balai RT',
      warna: '#8b5cf6',
      icon: 'construction',
      subItems: ['Semen & Material Bangunan', 'Upah Tukang Bangunan', 'Lampu Penerangan Jalan'],
      membutuhkanPihak: true,
      jenisPihak: 'entitas',
      pihakLabel: 'Toko Material / Mandor',
      aktif: true,
      isDefault: true,
      usageCount: 0
    },
    {
      id: 'CAT-OUT-006',
      nama: 'Lain-lain (Keluar)',
      tipe: 'Pengeluaran',
      deskripsi: 'Pengeluaran insidental lain yang telah disetujui pengurus',
      warna: '#64748b',
      icon: 'payments',
      subItems: ['Biaya Admin Bank', 'Sumbangan Bencana Alam', 'Insidental Darurat'],
      membutuhkanPihak: false,
      jenisPihak: 'bebas',
      pihakLabel: 'Pihak Terkait',
      aktif: true,
      isDefault: true,
      usageCount: 0
    }
  ];

  const DEFAULT_INVENTORY_CATEGORIES = [
    { id: 'INV-CAT-001', nama: 'Peralatan Tenda & Pesta', deskripsi: 'Tenda tratak, terpal, panggung kecil', icon: 'holiday_village', warna: '#6366f1', urutan: 1, aktif: true, isDefault: true },
    { id: 'INV-CAT-002', nama: 'Perlengkapan Makan & Masak', deskripsi: 'Piring, sendok, wajan besar, kompor', icon: 'restaurant', warna: '#10b981', urutan: 2, aktif: true, isDefault: true },
    { id: 'INV-CAT-003', nama: 'Kebersihan & Sanitasi', deskripsi: 'Alat kerja bakti, mesin rumput, sapu', icon: 'cleaning_services', warna: '#0ea5e9', urutan: 3, aktif: true, isDefault: true },
    { id: 'INV-CAT-004', nama: 'Keamanan & Ronda', deskripsi: 'HT, senter, rompi fosfor, borgol', icon: 'security', warna: '#f59e0b', urutan: 4, aktif: true, isDefault: true },
    { id: 'INV-CAT-005', nama: 'Olahraga & Seni', deskripsi: 'Meja pingpong, net voli, gamelan/rebana', icon: 'sports_volleyball', warna: '#ec4899', urutan: 5, aktif: true, isDefault: true },
    { id: 'INV-CAT-006', nama: 'Pertukangan & Fasum', deskripsi: 'Gergaji, gerobak sorong, tangga, bor', icon: 'handyman', warna: '#8b5cf6', urutan: 6, aktif: true, isDefault: true },
    { id: 'INV-CAT-007', nama: 'Elektronik & Sound', deskripsi: 'Wireless audio, mic, megaphone, speaker', icon: 'volume_up', warna: '#3b82f6', urutan: 7, aktif: true, isDefault: true },
    { id: 'INV-CAT-008', nama: 'ATK & Arsip', deskripsi: 'Stempel RT, map arsip, papan pengumuman', icon: 'inventory_2', warna: '#14b8a6', urutan: 8, aktif: true, isDefault: true },
    { id: 'INV-CAT-009', nama: 'Medis & P3K', deskripsi: 'Kotak P3K, tandu, tensimeter warga', icon: 'medical_services', warna: '#ef4444', urutan: 9, aktif: true, isDefault: true },
    { id: 'INV-CAT-010', nama: 'Penerangan & Kelistrikan', deskripsi: 'Genset, kabel roll, lampu sorot LED', icon: 'lightbulb', warna: '#f97316', urutan: 10, aktif: true, isDefault: true },
    { id: 'INV-CAT-011', nama: 'Lain-lain', deskripsi: 'Aset penunjang lingkungan lainnya', icon: 'category', warna: '#64748b', urutan: 11, aktif: true, isDefault: true }
  ];

  const DEFAULT_INVENTORY_ITEMS = [
    { id: 'INV-0001', nama: 'Tenda Pleton Besi (4x6m)', categoryId: 'INV-CAT-001', jumlahBaik: 2, jumlahCacat: 0, keterangan: 'Tersimpan di gudang balai RT, kondisi terpal utuh', lastCheckedAt: '2026-10-01', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0002', nama: 'Kursi Lipat Chitose Besi', categoryId: 'INV-CAT-001', jumlahBaik: 100, jumlahCacat: 4, keterangan: 'Warna merah marun berlogo RT 01', lastCheckedAt: '2026-10-01', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0003', nama: 'Meja Lipat Kayu Multifungsi', categoryId: 'INV-CAT-001', jumlahBaik: 12, jumlahCacat: 1, keterangan: '1 meja engsel baut agak kendor', lastCheckedAt: '2026-10-01', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0004', nama: 'Piring Keramik Putih Polos', categoryId: 'INV-CAT-002', jumlahBaik: 180, jumlahCacat: 6, keterangan: 'Isi 15 lusin, tersimpan di kardus bersegel', lastCheckedAt: '2026-09-25', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0005', nama: 'Sendok & Garpu Stainless', categoryId: 'INV-CAT-002', jumlahBaik: 240, jumlahCacat: 0, keterangan: '20 lusin komplit', lastCheckedAt: '2026-09-25', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0006', nama: 'Gelas Kaca Kopi & Tatakan', categoryId: 'INV-CAT-002', jumlahBaik: 120, jumlahCacat: 3, keterangan: '10 lusin di rak dapur balai', lastCheckedAt: '2026-09-25', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0007', nama: 'Mangkok Bakso Keramik', categoryId: 'INV-CAT-002', jumlahBaik: 80, jumlahCacat: 2, keterangan: 'Untuk hajatan warga', lastCheckedAt: '2026-09-25', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0008', nama: 'Termos Air Panas Jumbo 20L', categoryId: 'INV-CAT-002', jumlahBaik: 2, jumlahCacat: 0, keterangan: 'Merk Lion Star stainless', lastCheckedAt: '2026-09-25', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0009', nama: 'Wajan Kawah Besar No. 30', categoryId: 'INV-CAT-002', jumlahBaik: 3, jumlahCacat: 0, keterangan: 'Wajan baja tebal untuk gotong royong', lastCheckedAt: '2026-09-20', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0010', nama: 'Kompor Gas Semawar Mawar', categoryId: 'INV-CAT-002', jumlahBaik: 2, jumlahCacat: 1, keterangan: '1 unit regulator butuh ganti sil karet', lastCheckedAt: '2026-09-20', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0011', nama: 'Tabung Gas Elpiji 3kg', categoryId: 'INV-CAT-002', jumlahBaik: 3, jumlahCacat: 0, keterangan: 'Kondisi isi penuh siap pakai', lastCheckedAt: '2026-09-20', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0012', nama: 'Sound Portable Wireless 12 Inch', categoryId: 'INV-CAT-007', jumlahBaik: 1, jumlahCacat: 0, keterangan: 'Baterai lithium awet 6 jam + Bluetooth', lastCheckedAt: '2026-10-05', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0013', nama: 'Mic Wireless UHF Handheld', categoryId: 'INV-CAT-007', jumlahBaik: 2, jumlahCacat: 0, keterangan: 'Komplit baterai charger AA', lastCheckedAt: '2026-10-05', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0014', nama: 'Megaphone TOA ZR-2015S', categoryId: 'INV-CAT-007', jumlahBaik: 2, jumlahCacat: 0, keterangan: 'Sirine berfungsi jernih untuk ronda & woro-woro', lastCheckedAt: '2026-10-05', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0015', nama: 'Genset Bensin 3500 Watt', categoryId: 'INV-CAT-0010', jumlahBaik: 1, jumlahCacat: 0, keterangan: 'Oli rutin diganti, bensin siap 5 liter', lastCheckedAt: '2026-09-18', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0016', nama: 'Kabel Roll Tebal 50 Meter', categoryId: 'INV-CAT-0010', jumlahBaik: 3, jumlahCacat: 0, keterangan: 'Kabel serabut tembaga 3x2.5mm', lastCheckedAt: '2026-09-18', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0017', nama: 'Lampu Sorot LED Outdoor 100W', categoryId: 'INV-CAT-0010', jumlahBaik: 4, jumlahCacat: 1, keterangan: '1 unit kaca agak buram namun menyala terang', lastCheckedAt: '2026-09-18', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0018', nama: 'Rompi Fosfor Patroli Malam', categoryId: 'INV-CAT-004', jumlahBaik: 12, jumlahCacat: 0, keterangan: 'Ada strip reflektor hijau stabilo', lastCheckedAt: '2026-10-02', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0019', nama: 'Walkie Talkie HT Baofeng UV-5R', categoryId: 'INV-CAT-004', jumlahBaik: 6, jumlahCacat: 1, keterangan: 'Channel frekuensi RT sudah disinkronkan', lastCheckedAt: '2026-10-02', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0020', nama: 'Tongkat T Satpam & Borgol Besi', categoryId: 'INV-CAT-004', jumlahBaik: 4, jumlahCacat: 0, keterangan: 'Tersimpan di pos ronda utama', lastCheckedAt: '2026-10-02', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0021', nama: 'Mesin Rumput Dorong Bensin', categoryId: 'INV-CAT-003', jumlahBaik: 1, jumlahCacat: 0, keterangan: 'Bilah pisau baru diasah September 2026', lastCheckedAt: '2026-09-15', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0022', nama: 'Cangkul Baja Gagang Kayu Jati', categoryId: 'INV-CAT-003', jumlahBaik: 10, jumlahCacat: 1, keterangan: '1 cangkul patah gagang perlu penggantian', lastCheckedAt: '2026-09-15', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0023', nama: 'Sekop Pasir Besi Tebal', categoryId: 'INV-CAT-003', jumlahBaik: 8, jumlahCacat: 0, keterangan: 'Bersih terawat di rak alat gotong royong', lastCheckedAt: '2026-09-15', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0024', nama: 'Gerobak Sorong Artco Merah', categoryId: 'INV-CAT-006', jumlahBaik: 4, jumlahCacat: 1, keterangan: '1 ban mati perlu pompa/ganti ban dalam', lastCheckedAt: '2026-09-15', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0025', nama: 'Tandu Lipat Medis Aluminium', categoryId: 'INV-CAT-009', jumlahBaik: 2, jumlahCacat: 0, keterangan: 'Siap darurat bencana/evakuasi warga', lastCheckedAt: '2026-09-10', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0026', nama: 'Kotak P3K Lengkap & Oksigen Can', categoryId: 'INV-CAT-009', jumlahBaik: 3, jumlahCacat: 0, keterangan: 'Obat luka, perban, betadine, alkohol kedaluwarsa 2028', lastCheckedAt: '2026-09-10', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0027', nama: 'Meja Tenis Meja Donic + Net', categoryId: 'INV-CAT-005', jumlahBaik: 1, jumlahCacat: 0, keterangan: 'Roda lipat lancar di aula serbaguna', lastCheckedAt: '2026-09-01', lastCheckedBy: 'Siti Aminah' },
    { id: 'INV-0028', nama: 'Bola & Net Voli Mikasa', categoryId: 'INV-CAT-005', jumlahBaik: 3, jumlahCacat: 0, keterangan: 'Komplit dengan pompa bola dan jarum', lastCheckedAt: '2026-09-01', lastCheckedBy: 'Siti Aminah' }
  ];

  const PREPEND_COLS = new Set([
    'transactions',
    'notifications',
    'auditLogs',
    'reminderLogs',
    'inventoryChecks',
    'inventoryAdjustments',
    'systemActivityLogs'
  ]);

  const SYSTEM_ROLES = [
    {
      id: 'Admin',
      name: 'Administrator Sistem',
      description: 'Akses penuh ke seluruh konfigurasi, integrasi Firebase, monitoring database, audit, keuangan, dan data sistem.',
      icon: 'admin_panel_settings',
      color: '#4f46e5',
      isSystem: true,
      isLocked: false,
      permissions: ['*']
    },
    {
      id: 'KetuaRT',
      name: 'Ketua RT',
      description: 'Pengambil keputusan, monitoring arus kas, persetujuan cicilan, dan laporan warga.',
      icon: 'military_tech',
      color: '#0ea5e9',
      isSystem: true,
      isLocked: false,
      permissions: [
        'view_dashboard',
        'view_transactions',
        'view_categories',
        'view_residents',
        'manage_residents',
        'view_dues',
        'view_installments',
        'approve_installments',
        'view_reports',
        'export_reports',
        'view_audit',
        'view_inventory',
        'view_inventory_reports'
      ]
    },
    {
      id: 'Bendahara',
      name: 'Bendahara RT',
      description: 'Otoritas pencatatan keuangan, verifikasi iuran, cicilan, kas akun, dan tutup buku.',
      icon: 'account_balance_wallet',
      color: '#10b981',
      isSystem: true,
      isLocked: false,
      permissions: [
        'view_dashboard',
        'view_transactions',
        'manage_transactions',
        'void_transactions',
        'view_categories',
        'manage_categories',
        'view_dues',
        'manage_dues',
        'verify_dues',
        'view_installments',
        'manage_installments',
        'approve_installments',
        'transfer_accounts',
        'lock_periods',
        'view_reports',
        'export_reports',
        'view_residents',
        'manage_users',
        'approve_users',
        'view_inventory'
      ]
    },
    {
      id: 'Sekretaris',
      name: 'Sekretaris RT',
      description: 'Pengelola administrasi warga, penerbitan tagihan iuran, ekspor data, dan notifikasi.',
      icon: 'history_edu',
      color: '#8b5cf6',
      isSystem: true,
      isLocked: false,
      permissions: [
        'view_dashboard',
        'view_residents',
        'manage_residents',
        'view_dues',
        'generate_dues',
        'view_transactions',
        'view_reports',
        'export_reports',
        'import_export_data',
        'view_inventory'
      ]
    },
    {
      id: 'PetugasInventaris',
      name: 'Petugas Inventaris',
      description: 'Penanggung jawab pendataan barang aset RT, pembagian tim, dan jadwal pengecekan fisik.',
      icon: 'inventory_2',
      color: '#f59e0b',
      isSystem: true,
      isLocked: false,
      permissions: [
        'view_dashboard',
        'view_inventory',
        'manage_inventory',
        'manage_inventory_officers',
        'perform_inventory_check',
        'view_inventory_reports'
      ]
    },
    {
      id: 'Petugas',
      name: 'Petugas Lapangan',
      description: 'Petugas ronda atau kasir pembantu yang mencatat transaksi harian atau setoran warga.',
      icon: 'badge',
      color: '#06b6d4',
      isSystem: true,
      isLocked: false,
      permissions: [
        'view_dashboard',
        'view_transactions',
        'create_transactions',
        'view_dues',
        'record_dues',
        'view_residents',
        'view_inventory'
      ]
    },
    {
      id: 'Warga',
      name: 'Warga RT',
      description: 'Warga biasa untuk melihat portal tagihan pribadi, bukti kuitansi, dan inventaris publik.',
      icon: 'person',
      color: '#64748b',
      isSystem: true,
      isLocked: false,
      permissions: [
        'view_portal',
        'view_my_dues',
        'view_my_installments',
        'view_inventory'
      ]
    }
  ];

  const ALL_PERMISSIONS = [
    { id: 'view_dashboard', label: 'Lihat Dashboard', group: 'Administrasi' },
    { id: 'view_db_monitor', label: 'Monitoring Database Real-Time (Khusus Admin)', group: 'Administrasi' },
    { id: 'manage_users', label: 'Kelola Pengguna', group: 'Administrasi' },
    { id: 'approve_users', label: 'Setujui Pendaftaran Pengguna (Admin & Bendahara)', group: 'Administrasi' },
    { id: 'manage_roles', label: 'Kelola Role & Hak Akses', group: 'Administrasi' },
    { id: 'view_audit', label: 'Lihat Log Audit', group: 'Administrasi' },
    { id: 'manage_settings', label: 'Ubah Pengaturan Sistem', group: 'Administrasi' },
    { id: 'manage_firebase_credentials', label: 'Pengaturan Kredensial Firebase (Khusus Admin)', group: 'Administrasi' },
    { id: 'reset_database', label: 'Reset Penuh Database (Super Admin)', group: 'Administrasi' },
    { id: 'sync_database', label: 'Sinkronisasi Database ke Server', group: 'Administrasi' },
    { id: 'view_transactions', label: 'Lihat Transaksi Kas', group: 'Keuangan' },
    { id: 'manage_transactions', label: 'Tambah & Ubah Transaksi', group: 'Keuangan' },
    { id: 'create_transactions', label: 'Catat Transaksi Saja', group: 'Keuangan' },
    { id: 'void_transactions', label: 'Batalkan (Void) Transaksi', group: 'Keuangan' },
    { id: 'manage_categories', label: 'Kelola Kategori Kas', group: 'Keuangan' },
    { id: 'transfer_accounts', label: 'Transfer Antar Kas', group: 'Keuangan' },
    { id: 'lock_periods', label: 'Kunci / Tutup Buku Periode', group: 'Keuangan' },
    { id: 'view_reports', label: 'Lihat Pratinjau Laporan', group: 'Keuangan' },
    { id: 'export_reports', label: 'Ekspor Laporan (PDF/Excel/Word)', group: 'Keuangan' },
    { id: 'view_dues', label: 'Lihat Data Iuran', group: 'Iuran & Cicilan' },
    { id: 'generate_dues', label: 'Generate Tagihan Massal', group: 'Iuran & Cicilan' },
    { id: 'record_dues', label: 'Catat Pembayaran Iuran', group: 'Iuran & Cicilan' },
    { id: 'verify_dues', label: 'Verifikasi & Tolak Pembayaran', group: 'Iuran & Cicilan' },
    { id: 'view_installments', label: 'Lihat Rencana Cicilan', group: 'Iuran & Cicilan' },
    { id: 'manage_installments', label: 'Ajukan & Catat Setoran Cicilan', group: 'Iuran & Cicilan' },
    { id: 'approve_installments', label: 'Setujui / Tolak Rencana Cicilan', group: 'Iuran & Cicilan' },
    { id: 'view_residents', label: 'Lihat Data Warga', group: 'Data Warga' },
    { id: 'manage_residents', label: 'Kelola & Hapus Data Warga', group: 'Data Warga' },
    { id: 'import_export_data', label: 'Impor & Ekspor Data Warga/Keuangan', group: 'Data Warga' },
    { id: 'view_inventory', label: 'Lihat Daftar Barang Inventaris', group: 'Inventaris RT' },
    { id: 'manage_inventory', label: 'Kelola Barang & Kategori Aset', group: 'Inventaris RT' },
    { id: 'manage_inventory_officers', label: 'Kelola Petugas & Tim Inventaris', group: 'Inventaris RT' },
    { id: 'perform_inventory_check', label: 'Lakukan Pengecekan Fisik', group: 'Inventaris RT' },
    { id: 'view_inventory_reports', label: 'Lihat Laporan Inventaris', group: 'Inventaris RT' },
    { id: 'view_portal', label: 'Akses Portal Warga', group: 'Portal Warga' },
    { id: 'view_my_dues', label: 'Lihat Tagihan Pribadi', group: 'Portal Warga' },
    { id: 'view_my_installments', label: 'Lihat Cicilan Pribadi', group: 'Portal Warga' }
  ];

  const Constants = {
    LS_KEY,
    LS_SESSION,
    LS_THEME,
    LS_ACCENT,
    LS_GRADIENT,
    LS_DB_SYNC,
    LS_ACTIVITY_LOGS,
    ACCENTS,
    GRADIENTS,
    DEFAULT_CATEGORIES,
    DEFAULT_INVENTORY_CATEGORIES,
    DEFAULT_INVENTORY_ITEMS,
    PREPEND_COLS,
    SYSTEM_ROLES,
    ALL_PERMISSIONS
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Constants = Constants;
  window.KasRT_Constants_Loaded = true;
})();
