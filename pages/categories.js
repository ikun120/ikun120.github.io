/**
 * KasRT - Categories & Counterparty Configuration Page
 * Manajemen pos anggaran (#/app/kategori) dan konfigurasi sumber dana/pihak (#/app/sumber-dana)
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_Categories_Loaded) return;

  const Utils = window.KasRT.Utils;
  let activeTab = 'Pemasukan';

  const CategoriesPage = {
    renderCategories() {
      return this.render();
    },
    renderSources() {
      return this.renderCounterpartyConfig();
    },
    render() {
      const db = window.KasRT.DB;
      const categories = db.list('categories');
      const transactions = db.list('transactions').filter(t => t.status !== 'Void');
      const inCats = categories.filter(c => c.tipe === 'Pemasukan');
      const outCats = categories.filter(c => c.tipe === 'Pengeluaran');
      const displayed = activeTab === 'Pemasukan' ? inCats : outCats;
      const totalSubs = categories.reduce((sum, c) => sum + ((c.subItems && c.subItems.length) || 0), 0);

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-black font-display text-on-surface">Kategori & Pos Anggaran Kas</h2>
              <p class="text-xs text-slate-500">Mata anggaran penerimaan dan belanja lingkungan RT</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="KasRT.Pages.Categories.handleResetDefaultCategories()" class="px-3.5 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-50 cursor-pointer" title="Kembalikan daftar kategori & pos anggaran kas ke default sistem">
                <span class="material-symbols-outlined text-base">restart_alt</span>
                <span>Reset Default</span>
              </button>
              <a href="#/app/sumber-dana" class="px-3.5 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-surface-container">
                <span class="material-symbols-outlined text-base">handshake</span>
                <span>Konfigurasi Pihak & Vendor</span>
              </a>
              <button onclick="KasRT.Pages.Categories.openAddModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 cursor-pointer">
                <span class="material-symbols-outlined text-base">add</span>
                <span>Kategori Baru</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-4 rounded-2xl bg-surface-lowest border border-outline-variant">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Total Kategori</span>
              <div class="text-lg font-black font-mono text-on-surface mt-0.5">${categories.length}</div>
            </div>
            <div class="p-4 rounded-2xl bg-surface-lowest border border-outline-variant">
              <span class="text-[10px] font-bold text-emerald-600 uppercase">Pemasukan</span>
              <div class="text-lg font-black font-mono text-emerald-600 mt-0.5">${inCats.length} Pos</div>
            </div>
            <div class="p-4 rounded-2xl bg-surface-lowest border border-outline-variant">
              <span class="text-[10px] font-bold text-rose-600 uppercase">Pengeluaran</span>
              <div class="text-lg font-black font-mono text-rose-600 mt-0.5">${outCats.length} Pos</div>
            </div>
            <div class="p-4 rounded-2xl bg-surface-lowest border border-outline-variant">
              <span class="text-[10px] font-bold text-primary uppercase">Sub-Kategori</span>
              <div class="text-lg font-black font-mono text-primary mt-0.5">${totalSubs} Varian</div>
            </div>
          </div>

          <div class="flex items-center gap-2 border-b border-outline-variant pb-2">
            <button onclick="KasRT.Pages.Categories.switchTab('Pemasukan')" class="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'Pemasukan' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-surface-container'}">
              <span class="material-symbols-outlined text-base">arrow_downward</span>
              <span>Pemasukan (${inCats.length})</span>
            </button>
            <button onclick="KasRT.Pages.Categories.switchTab('Pengeluaran')" class="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'Pengeluaran' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-surface-container'}">
              <span class="material-symbols-outlined text-base">arrow_upward</span>
              <span>Pengeluaran (${outCats.length})</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${displayed.map(cat => {
              const catTrx = transactions.filter(t => t.categoryId === cat.id);
              const totalNominal = catTrx.reduce((sum, t) => sum + (t.jumlah || 0), 0);
              const subs = cat.subItems || [];
              return `
                <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-all">
                  <div class="absolute top-0 inset-x-0 h-1.5" style="background-color: ${cat.warna || '#4f46e5'}"></div>
                  <div>
                    <div class="flex items-start justify-between gap-2 mt-1 mb-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm" style="background-color: ${cat.warna || '#4f46e5'}">
                          <span class="material-symbols-outlined text-xl">${cat.icon || 'category'}</span>
                        </div>
                        <div>
                          <h3 class="font-bold text-sm text-on-surface">${cat.nama}</h3>
                          <span class="text-[10px] font-mono text-slate-400">${cat.id}</span>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[9px] font-bold ${cat.isDefault ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-primary/10 text-primary'}">
                        ${cat.isDefault ? 'Sistem' : 'Kustom'}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 leading-relaxed mb-4">${cat.deskripsi || 'Pos anggaran operasional lingkungan.'}</p>
                    ${subs.length > 0 ? `
                      <div class="mb-4">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Sub-Pos Anggaran:</span>
                        <div class="flex flex-wrap gap-1">
                          ${subs.map(s => `
                            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                              ${s}
                            </span>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                  <div class="pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs">
                    <div>
                      <span class="text-[10px] text-slate-400 font-semibold">Total Mutasi:</span>
                      <div class="font-black font-mono text-on-surface">${Utils.formatRp(totalNominal)}</div>
                    </div>
                    <div class="flex items-center gap-1">
                      <button onclick="KasRT.Pages.Categories.openEditModal('${cat.id}')" title="Ubah" class="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-surface-container cursor-pointer">
                        <span class="material-symbols-outlined text-base">edit</span>
                      </button>
                      ${!cat.isDefault ? `
                        <button onclick="KasRT.Pages.Categories.handleDelete('${cat.id}')" title="Hapus" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer">
                          <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    switchTab(tab) {
      activeTab = tab;
      window.KasRT.Events.handleRouting();
    },

    renderCounterpartyConfig() {
      const db = window.KasRT.DB;
      const categories = db.list('categories');
      const displayed = categories.filter(c => c.tipe === activeTab);

      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <a href="#/app/kategori" class="text-xs font-semibold text-primary hover:underline">← Kembali ke Kategori</a>
              </div>
              <h2 class="text-xl font-black font-display text-on-surface">Konfigurasi Pihak & Sumber Dana</h2>
              <p class="text-xs text-slate-500">Atur apakah kategori kas memerlukan identitas warga, entitas vendor, atau teks bebas</p>
            </div>
            <button onclick="KasRT.Pages.Categories.saveCounterpartyConfigs()" class="px-5 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-md cursor-pointer">
              Simpan Konfigurasi
            </button>
          </div>
          <div class="flex items-center gap-2 border-b border-outline-variant pb-2">
            <button onclick="KasRT.Pages.Categories.switchCounterpartyTab('Pemasukan')" class="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${activeTab === 'Pemasukan' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-surface-container'}">Pemasukan</button>
            <button onclick="KasRT.Pages.Categories.switchCounterpartyTab('Pengeluaran')" class="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${activeTab === 'Pengeluaran' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-surface-container'}">Pengeluaran</button>
          </div>
          <div class="bg-surface-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left min-w-[580px]">
              <thead class="bg-surface-container/60 text-[10px] font-bold uppercase text-slate-400 border-b border-outline-variant">
                <tr>
                  <th class="py-3 px-4">Kategori Kas</th>
                  <th class="py-3 px-4 text-center">Membutuhkan Pihak?</th>
                  <th class="py-3 px-4">Jenis Input Pihak</th>
                  <th class="py-3 px-4">Label Formulir Transaksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/50">
                ${displayed.map(cat => `
                  <tr data-cat-id="${cat.id}">
                    <td class="py-3 px-4 font-bold">
                      <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${cat.warna}"></span>
                        <span>${cat.nama}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <input type="checkbox" class="cfg-need-pihak rounded text-primary" ${cat.membutuhkanPihak ? 'checked' : ''} />
                    </td>
                    <td class="py-3 px-4">
                      <select class="cfg-jenis-pihak px-2 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs cursor-pointer">
                        <option value="warga" ${cat.jenisPihak === 'warga' ? 'selected' : ''}>Pilih Data Warga (Dropdown)</option>
                        <option value="entitas" ${cat.jenisPihak === 'entitas' ? 'selected' : ''}>Nama Vendor / Lembaga</option>
                        <option value="bebas" ${cat.jenisPihak === 'bebas' ? 'selected' : ''}>Teks Bebas / Fleksibel</option>
                        <option value="none" ${cat.jenisPihak === 'none' ? 'selected' : ''}>Tanpa Pihak</option>
                      </select>
                    </td>
                    <td class="py-3 px-4">
                      <input type="text" class="cfg-label-pihak px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest w-full text-xs" value="${cat.pihakLabel || 'Pihak Terkait'}" />
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      `;
    },

    switchCounterpartyTab(tab) {
      activeTab = tab;
      window.KasRT.Events.handleRouting();
    },

    async saveCounterpartyConfigs() {
      const db = window.KasRT.DB;
      const rows = document.querySelectorAll('tr[data-cat-id]');
      for (const r of rows) {
        const id = r.getAttribute('data-cat-id');
        const need = r.querySelector('.cfg-need-pihak')?.checked;
        const jenis = r.querySelector('.cfg-jenis-pihak')?.value;
        const label = r.querySelector('.cfg-label-pihak')?.value;
        await db.update('categories', id, {
          membutuhkanPihak: need,
          jenisPihak: jenis,
          pihakLabel: label
        });
      }
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast('Konfigurasi pihak kategori berhasil disimpan!', 'success');
      }
    },

    openAddModal() {
      const colors = ['#10b981', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];
      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Tambah Kategori Kas Baru</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Categories.handleSubmitAdd(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Jenis Kategori</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="flex items-center gap-2 p-3 rounded-xl border border-outline-variant cursor-pointer">
                  <input type="radio" name="new-cat-type" value="Pemasukan" checked />
                  <span class="font-bold text-emerald-600">Pemasukan</span>
                </label>
                <label class="flex items-center gap-2 p-3 rounded-xl border border-outline-variant cursor-pointer">
                  <input type="radio" name="new-cat-type" value="Pengeluaran" />
                  <span class="font-bold text-rose-600">Pengeluaran</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">Nama Kategori</label>
              <input type="text" id="new-cat-name" required placeholder="Contoh: Perbaikan Gapura" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-bold mb-1">Deskripsi Pos Anggaran</label>
              <textarea id="new-cat-desc" rows="2" placeholder="Uraian peruntukan pos..." class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest"></textarea>
            </div>
            <div>
              <label class="block font-bold mb-1">Daftar Sub-Kategori (Satu baris per varian)</label>
              <textarea id="new-cat-subs" rows="3" placeholder="Semen & Pasir&#10;Cat Tembok&#10;Upah Tukang" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono"></textarea>
            </div>
            <div>
              <label class="block font-bold mb-1">Warna Aksen</label>
              <div class="flex items-center gap-2">
                ${colors.map(c => `
                  <label class="w-7 h-7 rounded-xl cursor-pointer flex items-center justify-center border-2 border-white shadow-sm" style="background-color: ${c}">
                    <input type="radio" name="new-cat-color" value="${c}" class="opacity-0" ${c === '#10b981' ? 'checked' : ''} />
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan Kategori</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitAdd(e) {
      e.preventDefault();
      const tipe = document.querySelector('input[name="new-cat-type"]:checked')?.value || 'Pemasukan';
      const nama = document.getElementById('new-cat-name')?.value;
      const desc = document.getElementById('new-cat-desc')?.value;
      const subsRaw = document.getElementById('new-cat-subs')?.value || '';
      const warna = document.querySelector('input[name="new-cat-color"]:checked')?.value || '#4f46e5';
      const subItems = subsRaw.split('\n').map(s => s.trim()).filter(Boolean);

      const db = window.KasRT.DB;
      const id = db.nextId(tipe === 'Pemasukan' ? 'CAT-IN' : 'CAT-OUT', 'categories');
      const catDoc = {
        id,
        nama,
        tipe,
        deskripsi: desc,
        warna,
        icon: 'folder',
        subItems,
        membutuhkanPihak: true,
        jenisPihak: tipe === 'Pemasukan' ? 'warga' : 'entitas',
        pihakLabel: tipe === 'Pemasukan' ? 'Penyetor' : 'Penerima',
        aktif: true,
        isDefault: false,
        usageCount: 0
      };

      await db.set('categories', catDoc);
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast(`Kategori "${nama}" berhasil dibuat!`, 'success');
        window.KasRT.UI.closeModal();
      }
      window.KasRT.Events.handleRouting();
    },

    openEditModal(id) {
      const db = window.KasRT.DB;
      const cat = db.get('categories', id);
      if (!cat) return;

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Ubah Kategori (${cat.nama})</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Categories.handleSubmitEdit(event, '${cat.id}')" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Nama Kategori</label>
              <input type="text" id="edit-cat-name" value="${cat.nama}" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-bold mb-1">Deskripsi</label>
              <textarea id="edit-cat-desc" rows="2" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest">${cat.deskripsi || ''}</textarea>
            </div>
            <div>
              <label class="block font-bold mb-1">Sub-Kategori (Satu baris per varian)</label>
              <textarea id="edit-cat-subs" rows="3" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono">${(cat.subItems || []).join('\n')}</textarea>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitEdit(e, id) {
      e.preventDefault();
      const nama = document.getElementById('edit-cat-name')?.value;
      const desc = document.getElementById('edit-cat-desc')?.value;
      const subsRaw = document.getElementById('edit-cat-subs')?.value || '';
      const subItems = subsRaw.split('\n').map(s => s.trim()).filter(Boolean);

      await window.KasRT.DB.update('categories', id, {
        nama,
        deskripsi: desc,
        subItems
      });

      if (window.KasRT.UI) {
        window.KasRT.UI.showToast('Kategori berhasil diperbarui!', 'success');
        window.KasRT.UI.closeModal();
      }
      window.KasRT.Events.handleRouting();
    },

    async handleDelete(id) {
      const confirm = await window.KasRT.UI.confirmModal({
        title: 'Hapus Kategori',
        message: 'Apakah Anda yakin ingin menghapus kategori ini? Transaksi lampau yang telah tercatat tetap akan tersimpan.',
        danger: true
      });
      if (confirm) {
        await window.KasRT.DB.remove('categories', id);
        if (window.KasRT.UI) window.KasRT.UI.showToast('Kategori dihapus.', 'info');
        window.KasRT.Events.handleRouting();
      }
    },

    async handleResetDefaultCategories() {
      const confirmed = await window.KasRT.UI.confirmModal({
        title: 'Kembalikan Kategori ke Default?',
        message: 'Daftar pos & kategori pemasukan dan pengeluaran kas RT akan dikembalikan ke pengaturan default sistem.',
        confirmText: 'Ya, Kembalikan Default',
        cancelText: 'Batal'
      });
      if (!confirmed) return;
      const db = window.KasRT.DB;
      const defaults = JSON.parse(JSON.stringify(window.KasRT.Constants.DEFAULT_CATEGORIES));
      await db.resetCollection('categories');
      for (const cat of defaults) {
        await db.set('categories', cat);
      }
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast('Daftar kategori & pos anggaran kas berhasil dikembalikan ke default!', 'success');
      }
      window.KasRT.Events.handleRouting();
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.Categories = CategoriesPage;
  window.KasRT_Pages_Categories_Loaded = true;
})();
