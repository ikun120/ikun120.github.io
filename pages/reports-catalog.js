/**
 * KasRT - Report Catalog Management Page
 * Pengelolaan lengkap Katalog Laporan & Ekspor Dokumen
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_ReportsCatalog_Loaded) return;

  const Utils = window.KasRT.Utils;
  let activeGroup = 'Semua';
  let searchQuery = '';
  let statusFilter = 'all';
  let viewMode = 'grid';

  const GROUP_THEMES = {
    Kas: {
      border: 'border-indigo-200 dark:border-indigo-800',
      bgLight: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
      badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
      iconBg: 'bg-indigo-600 text-white'
    },
    Warga: {
      border: 'border-sky-200 dark:border-sky-800',
      bgLight: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
      badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
      iconBg: 'bg-sky-600 text-white'
    },
    Iuran: {
      border: 'border-emerald-200 dark:border-emerald-800',
      bgLight: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
      iconBg: 'bg-emerald-600 text-white'
    },
    Cicilan: {
      border: 'border-violet-200 dark:border-violet-800',
      bgLight: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
      badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200',
      iconBg: 'bg-violet-600 text-white'
    },
    Sistem: {
      border: 'border-rose-200 dark:border-rose-800',
      bgLight: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
      iconBg: 'bg-rose-600 text-white'
    },
    Inventaris: {
      border: 'border-amber-200 dark:border-amber-800',
      bgLight: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
      iconBg: 'bg-amber-600 text-white'
    }
  };

  const DEFAULT_THEME = {
    border: 'border-slate-200 dark:border-slate-700',
    bgLight: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    iconBg: 'bg-slate-700 text-white'
  };

  const ReportsCatalogPage = {
    renderCatalog() {
      return this.render();
    },
    render() {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? auth.user : null;
      const isAdmin = Boolean(auth && auth.Permissions && auth.Permissions.isAdmin(user));
      const catalogService = window.KasRT && window.KasRT.Reports && window.KasRT.Reports.Catalog;
      const allReports = catalogService ? catalogService.list() : [];
      const groups = catalogService ? catalogService.groups() : ['Kas', 'Warga', 'Iuran', 'Cicilan', 'Sistem', 'Inventaris'];

      let filtered = allReports;
      if (activeGroup && activeGroup !== 'Semua') {
        filtered = filtered.filter(r => r.group === activeGroup);
      }
      if (statusFilter === 'active') {
        filtered = filtered.filter(r => r.active !== false);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(r => r.active === false);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(r =>
          (r.code && r.code.toLowerCase().includes(q)) ||
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.desc && r.desc.toLowerCase().includes(q)) ||
          (r.group && r.group.toLowerCase().includes(q))
        );
      }

      const totalCount = allReports.length;
      const activeCount = allReports.filter(r => r.active !== false).length;
      const inactiveCount = totalCount - activeCount;

      return `
        <div class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <span class="text-[11px] font-extrabold uppercase tracking-widest text-primary">Manajemen Laporan Resmi RT</span>
              </div>
              <h2 class="text-2xl font-black font-display text-on-surface">Katalog Laporan & Ekspor Dokumen</h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Kelola template laporan, tambah format kustom, pratinjau live, dan ekspor multi-format ber-SHA256.</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              ${isAdmin ? `
                <button onclick="KasRT.Pages.ReportsCatalog.handleResetDefault()" class="px-3.5 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-surface-container transition-colors cursor-pointer" title="Kembalikan ke 31 template standar awal">
                  <span class="material-symbols-outlined text-base text-slate-400">restart_alt</span>
                  <span class="hidden sm:inline">Pulihkan Bawaan</span>
                </button>
              ` : ''}
              <button onclick="KasRT.Pages.ReportsCatalog.openAddModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                <span class="material-symbols-outlined text-base">add_circle</span>
                <span>Tambah Laporan Baru</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-xs">
              <div class="flex items-center justify-between text-slate-400">
                <span class="text-[10px] font-bold uppercase tracking-wider">Total Format</span>
                <span class="material-symbols-outlined text-lg">folder_open</span>
              </div>
              <div class="text-xl sm:text-2xl font-black font-mono text-on-surface mt-1">${totalCount}</div>
              <span class="text-[10px] text-slate-400 font-medium">${groups.length} kelompok dokumen</span>
            </div>
            <div class="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-xs">
              <div class="flex items-center justify-between text-emerald-600">
                <span class="text-[10px] font-bold uppercase tracking-wider">Format Aktif</span>
                <span class="material-symbols-outlined text-lg">check_circle</span>
              </div>
              <div class="text-xl sm:text-2xl font-black font-mono text-emerald-600 mt-1">${activeCount}</div>
              <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Siap cetak & ekspor</span>
            </div>
            <div class="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-xs">
              <div class="flex items-center justify-between text-slate-400">
                <span class="text-[10px] font-bold uppercase tracking-wider">Format Nonaktif</span>
                <span class="material-symbols-outlined text-lg">block</span>
              </div>
              <div class="text-xl sm:text-2xl font-black font-mono text-slate-500 mt-1">${inactiveCount}</div>
              <span class="text-[10px] text-slate-400 font-medium">Disembunyikan</span>
            </div>
            <div class="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-xs">
              <div class="flex items-center justify-between text-primary">
                <span class="text-[10px] font-bold uppercase tracking-wider">Kategori Grup</span>
                <span class="material-symbols-outlined text-lg">category</span>
              </div>
              <div class="text-xl sm:text-2xl font-black font-mono text-primary mt-1">${groups.length}</div>
              <span class="text-[10px] text-primary/80 font-medium">Klasifikasi modular</span>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-xs space-y-3.5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="relative flex-1 max-w-md">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                  type="text"
                  placeholder="Cari kode (KAS-01), nama, deskripsi..."
                  value="${searchQuery}"
                  oninput="KasRT.Pages.ReportsCatalog.setSearch(this.value)"
                  class="w-full pl-9 pr-8 py-2 rounded-xl border border-outline-variant bg-surface-container/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div class="flex items-center gap-2 self-end sm:self-auto">
                <select
                  onchange="KasRT.Pages.ReportsCatalog.setStatusFilter(this.value)"
                  class="px-3 py-2 rounded-xl border border-outline-variant bg-surface-container/40 text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Semua Status (${totalCount})</option>
                  <option value="active" ${statusFilter === 'active' ? 'selected' : ''}>Hanya Aktif (${activeCount})</option>
                  <option value="inactive" ${statusFilter === 'inactive' ? 'selected' : ''}>Hanya Nonaktif (${inactiveCount})</option>
                </select>
                <div class="flex items-center border border-outline-variant rounded-xl p-0.5 bg-surface-container/30">
                  <button onclick="KasRT.Pages.ReportsCatalog.setViewMode('grid')" class="p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-surface-lowest text-primary shadow-xs' : 'text-slate-400 hover:text-slate-600'}" title="Tampilan Kartu">
                    <span class="material-symbols-outlined text-base">grid_view</span>
                  </button>
                  <button onclick="KasRT.Pages.ReportsCatalog.setViewMode('table')" class="p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-surface-lowest text-primary shadow-xs' : 'text-slate-400 hover:text-slate-600'}" title="Tampilan Tabel Rinci">
                    <span class="material-symbols-outlined text-base">view_list</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <button
                onclick="KasRT.Pages.ReportsCatalog.setGroupFilter('Semua')"
                class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeGroup === 'Semua' ? 'bg-theme-gradient text-white shadow-xs' : 'bg-surface-container/50 text-slate-600 dark:text-slate-300 hover:bg-surface-container'}"
              >
                Semua (${totalCount})
              </button>
              ${groups.map(g => {
                const count = allReports.filter(r => r.group === g).length;
                const isSelected = activeGroup === g;
                return `
                  <button
                    onclick="KasRT.Pages.ReportsCatalog.setGroupFilter('${g}')"
                    class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isSelected ? 'bg-theme-gradient text-white shadow-xs' : 'bg-surface-container/50 text-slate-600 dark:text-slate-300 hover:bg-surface-container'}"
                  >
                    <span>${g}</span>
                    <span class="ml-1 opacity-70 text-[10px]">(${count})</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          ${filtered.length === 0 ? `
            <div class="py-16 text-center p-6 rounded-3xl bg-surface-lowest border border-dashed border-outline-variant">
              <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <span class="material-symbols-outlined text-3xl">search_off</span>
              </div>
              <h3 class="font-extrabold text-base text-on-surface">Format Laporan Tidak Ditemukan</h3>
              <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">Tidak ada template laporan yang cocok dengan kata kunci atau filter kelompok terpilih.</p>
            </div>
          ` : viewMode === 'grid' ? `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              ${filtered.map(r => this.renderCard(r, isAdmin)).join('')}
            </div>
          ` : `
            <div class="rounded-2xl border border-outline-variant bg-surface-lowest overflow-hidden shadow-xs">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-surface-container/60 border-b border-outline-variant text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <tr>
                      <th class="py-3 px-4 text-center w-12">No</th>
                      <th class="py-3 px-4 w-28">Kode</th>
                      <th class="py-3 px-4">Nama Laporan & Deskripsi</th>
                      <th class="py-3 px-4 w-28">Kelompok</th>
                      <th class="py-3 px-4 text-center w-20">Urutan</th>
                      <th class="py-3 px-4 text-center w-28">Status</th>
                      <th class="py-3 px-4 text-center w-48">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-variant/60">
                    ${filtered.map((r, idx) => this.renderTableRow(r, idx, isAdmin)).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `}
        </div>
      `;
    },

    renderCard(r, isAdmin = false) {
      const theme = GROUP_THEMES[r.group] || DEFAULT_THEME;
      const isActive = r.active !== false;

      return `
        <div class="p-5 rounded-3xl bg-surface-lowest border ${isActive ? 'border-outline-variant hover:border-primary' : 'border-outline-variant/50 opacity-75'} shadow-xs flex flex-col justify-between transition-all hover:shadow-md relative group">
          <div>
            <div class="flex items-start justify-between gap-2.5 mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-2xl ${theme.iconBg} flex items-center justify-center font-bold shadow-xs flex-shrink-0">
                  <span class="material-symbols-outlined text-xl">${r.icon || 'description'}</span>
                </div>
                <div>
                  <span class="font-mono text-xs font-black text-on-surface tracking-wider block">${r.code}</span>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${theme.badge} inline-block mt-0.5">
                    ${r.group}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onclick="KasRT.Pages.ReportsCatalog.handleToggleStatus('${r.code}')"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:opacity-85'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 hover:opacity-85'
                }"
                title="Klik untuk mengubah status aktif/nonaktif"
              >
                ${isActive ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>
            <h3 class="font-extrabold text-sm text-on-surface leading-snug group-hover:text-primary transition-colors">${r.name}</h3>
            <p class="text-xs text-slate-500 mt-1 mb-3.5 leading-relaxed line-clamp-2">${r.desc || 'Format laporan berkala RT resmi siap verifikasi SHA256.'}</p>
          </div>
          <div class="pt-3 border-t border-outline-variant/60 flex items-center gap-2">
            <button
              onclick="KasRT.Reports.Export.showPreviewModal('${r.code}')"
              class="flex-1 py-2 px-3 rounded-xl bg-theme-gradient text-white text-xs font-bold shadow-xs hover:opacity-90 flex items-center justify-center gap-1.5 transition-opacity cursor-pointer"
              title="Pratinjau & Ekspor Dokumen"
            >
              <span class="material-symbols-outlined text-base">visibility</span>
              <span>Pratinjau & Ekspor</span>
            </button>
            <button
              onclick="KasRT.Pages.ReportsCatalog.openEditModal('${r.code}')"
              class="w-8 h-8 rounded-xl border border-outline-variant text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
              title="Ubah Format Laporan"
            >
              <span class="material-symbols-outlined text-base">edit</span>
            </button>
            ${isAdmin ? `
              <button
                onclick="KasRT.Pages.ReportsCatalog.handleDelete('${r.code}')"
                class="w-8 h-8 rounded-xl border border-outline-variant text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                title="Hapus Laporan (Khusus Hak Administrator)"
              >
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    },

    renderTableRow(r, idx, isAdmin = false) {
      const theme = GROUP_THEMES[r.group] || DEFAULT_THEME;
      const isActive = r.active !== false;

      return `
        <tr class="hover:bg-surface-container/30 transition-colors ${!isActive ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/30' : ''}">
          <td class="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">${idx + 1}</td>
          <td class="py-3 px-4 font-mono font-black text-on-surface">${r.code}</td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg ${theme.iconBg} flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-sm">${r.icon || 'description'}</span>
              </span>
              <div class="min-w-0">
                <div class="font-bold text-on-surface truncate">${r.name}</div>
                <div class="text-[11px] text-slate-500 truncate max-w-md">${r.desc || '-'}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${theme.badge}">
              ${r.group}
            </span>
          </td>
          <td class="py-3 px-4 text-center font-mono text-slate-500 font-bold">#${r.order || 99}</td>
          <td class="py-3 px-4 text-center">
            <button
              onclick="KasRT.Pages.ReportsCatalog.handleToggleStatus('${r.code}')"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                isActive
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }"
              title="Klik untuk mengubah status aktif/nonaktif"
            >
              ${isActive ? 'Aktif' : 'Nonaktif'}
            </button>
          </td>
          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button
                onclick="KasRT.Reports.Export.showPreviewModal('${r.code}')"
                class="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Pratinjau & Ekspor Dokumen"
              >
                <span class="material-symbols-outlined text-sm">visibility</span>
                <span class="hidden sm:inline">Pratinjau</span>
              </button>
              <button
                onclick="KasRT.Pages.ReportsCatalog.openEditModal('${r.code}')"
                class="w-7 h-7 rounded-lg text-slate-500 hover:text-primary hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
                title="Ubah Format Laporan"
              >
                <span class="material-symbols-outlined text-base">edit</span>
              </button>
              ${isAdmin ? `
                <button
                  onclick="KasRT.Pages.ReportsCatalog.handleDelete('${r.code}')"
                  class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                  title="Hapus Laporan (Khusus Hak Administrator)"
                >
                  <span class="material-symbols-outlined text-base">delete</span>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    },

    setGroupFilter(group) {
      activeGroup = group;
      window.KasRT.Events.handleRouting();
    },

    setSearch(query) {
      searchQuery = query;
      window.KasRT.Events.handleRouting();
    },

    setStatusFilter(status) {
      statusFilter = status;
      window.KasRT.Events.handleRouting();
    },

    setViewMode(mode) {
      viewMode = mode;
      window.KasRT.Events.handleRouting();
    },

    openAddModal() {
      const catalog = window.KasRT && window.KasRT.Reports && window.KasRT.Reports.Catalog;
      const groups = catalog ? catalog.groups() : ['Kas', 'Warga', 'Iuran', 'Cicilan', 'Sistem', 'Inventaris'];
      const nextOrder = (catalog ? catalog.list().length : 0) + 1;

      const html = `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <span class="material-symbols-outlined text-2xl">add_box</span>
              </div>
              <div>
                <h3 class="font-extrabold text-base text-on-surface font-display">Tambah Template Laporan Baru</h3>
                <p class="text-xs text-slate-500">Daftarkan format dokumen resmi siap cetak dan ekspor ber-SHA256</p>
              </div>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <form onsubmit="KasRT.Pages.ReportsCatalog.handleSubmitAdd(event)" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Kode Laporan <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="new-report-code"
                  required
                  placeholder="Contoh: KAS-09"
                  class="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest font-mono uppercase font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Urutan Tampilan
                </label>
                <input
                  type="number"
                  id="new-report-order"
                  value="${nextOrder}"
                  min="1"
                  max="999"
                  class="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest font-mono font-bold"
                />
              </div>
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nama Laporan Resmi <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="new-report-name"
                required
                placeholder="Contoh: Rekapitulasi Donasi Kas"
                class="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest font-bold text-on-surface"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Kelompok Dokumen
              </label>
              <select
                id="new-report-group"
                class="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest font-bold text-on-surface cursor-pointer"
              >
                ${groups.map(g => `<option value="${g}">${g}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Deskripsi
              </label>
              <textarea
                id="new-report-desc"
                rows="2"
                placeholder="Ringkasan data laporan..."
                class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs text-on-surface"
              ></textarea>
            </div>
            <div class="pt-4 border-t border-outline-variant flex items-center justify-end gap-2.5">
              <button
                type="button"
                onclick="KasRT.UI.closeModal()"
                class="px-4 py-2 rounded-xl border border-outline-variant font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold shadow-md hover:opacity-90 cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'lg' });
    },

    async handleSubmitAdd(e) {
      e.preventDefault();
      const code = document.getElementById('new-report-code')?.value;
      const name = document.getElementById('new-report-name')?.value;
      const group = document.getElementById('new-report-group')?.value;
      const order = Number(document.getElementById('new-report-order')?.value) || 99;
      const desc = document.getElementById('new-report-desc')?.value || '';
      const catalogService = window.KasRT && window.KasRT.Reports && window.KasRT.Reports.Catalog;
      if (!catalogService) return;

      try {
        const auth = window.KasRT && window.KasRT.Auth;
        await catalogService.create({
          code,
          name,
          group,
          icon: 'description',
          order,
          desc,
          active: true,
          format: 'PDF, Excel, Word'
        }, auth?.user);

        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Laporan "${code}" berhasil ditambahkan!`, 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(err.message, 'error');
        }
      }
    },

    openEditModal(code) {
      const catalogService = window.KasRT && window.KasRT.Reports && window.KasRT.Reports.Catalog;
      const report = catalogService ? catalogService.getByCode(code) : null;
      if (!report) return;
      const groups = catalogService ? catalogService.groups() : ['Kas', 'Warga', 'Iuran', 'Cicilan', 'Sistem', 'Inventaris'];

      const html = `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
            <h3 class="font-extrabold text-base text-on-surface">Ubah Format Laporan (${report.code})</h3>
            <button onclick="KasRT.UI.closeModal()" class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.ReportsCatalog.handleSubmitEdit(event, '${report.code}')" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Kode Laporan</label>
              <input type="text" value="${report.code}" disabled class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container font-mono font-bold text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label class="block font-bold mb-1">Nama Laporan</label>
              <input type="text" id="edit-report-name" value="${report.name}" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-bold text-on-surface" />
            </div>
            <div>
              <label class="block font-bold mb-1">Kelompok</label>
              <select id="edit-report-group" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-bold text-on-surface cursor-pointer">
                ${groups.map(g => `<option value="${g}" ${g === report.group ? 'selected' : ''}>${g}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">Deskripsi</label>
              <textarea id="edit-report-desc" rows="2" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs">${report.desc || ''}</textarea>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-2.5">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitEdit(e, code) {
      e.preventDefault();
      const name = document.getElementById('edit-report-name')?.value;
      const group = document.getElementById('edit-report-group')?.value;
      const desc = document.getElementById('edit-report-desc')?.value;
      const catalogService = window.KasRT && window.KasRT.Reports && window.KasRT.Reports.Catalog;
      if (!catalogService) return;

      try {
        const auth = window.KasRT && window.KasRT.Auth;
        await catalogService.update(code, { name, group, desc }, auth?.user);
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Perubahan template "${code}" berhasil disimpan!`, 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    async handleToggleStatus(code) {
      const catalogService = window.KasRT && window.KasRT.Reports && window.KasRT.Reports.Catalog;
      if (!catalogService) return;
      const auth = window.KasRT && window.KasRT.Auth;
      await catalogService.toggleActive(code, auth?.user);
      window.KasRT.Events.handleRouting();
    },

    async handleDelete(code) {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? auth.user : null;
      const isAdmin = Boolean(auth && auth.Permissions && auth.Permissions.isAdmin(user));

      if (!isAdmin) {
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Akses Ditolak: Hanya Administrator yang berwenang menghapus template dari Katalog Laporan.', 'error');
        }
        return;
      }

      const confirm = await window.KasRT.UI.confirmModal({
        title: `Hapus Laporan (${code})`,
        message: 'Apakah Anda yakin ingin menghapus template laporan ini dari katalog resmi? Tindakan ini hanya dapat dilakukan oleh Administrator.',
        danger: true
      });
      if (confirm) {
        try {
          const catalogService = window.KasRT && window.KasRT.Reports && window.KasRT.Reports.Catalog;
          await catalogService?.remove(code, user);
          if (window.KasRT.UI) {
            window.KasRT.UI.showToast(`Template laporan "${code}" berhasil dihapus.`, 'info');
          }
          window.KasRT.Events.handleRouting();
        } catch (err) {
          if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
        }
      }
    },

    async handleResetDefault() {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? auth.user : null;
      const isAdmin = Boolean(auth && auth.Permissions && auth.Permissions.isAdmin(user));
      if (!isAdmin) {
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Akses Ditolak: Hanya Administrator yang berwenang memulihkan template bawaan.', 'error');
        }
        return;
      }

      const confirm = await window.KasRT.UI.confirmModal({
        title: 'Pulihkan Template Bawaan',
        message: 'Kembalikan seluruh 31 template laporan standar resmi RT?',
        danger: false
      });
      if (confirm) {
        try {
          const catalogService = window.KasRT && window.KasRT.Reports && window.KasRT.Reports.Catalog;
          await catalogService?.resetToDefault(user);
          if (window.KasRT.UI) {
            window.KasRT.UI.showToast('31 template laporan standar berhasil dipulihkan!', 'success');
          }
          window.KasRT.Events.handleRouting();
        } catch (err) {
          if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
        }
      }
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.ReportsCatalog = ReportsCatalogPage;
  window.KasRT_Pages_ReportsCatalog_Loaded = true;
})();
