/**
 * KasRT - Residents Management Page
 * Form pendaftaran warga ultra-simplified, pencarian cepat, soft-delete, dan Superadmin cascade delete
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_Residents_Loaded) return;

  const Utils = window.KasRT.Utils;
  let activeSearch = '';

  const ResidentsPage = {
    render() {
      const db = window.KasRT.DB;
      const allResidents = db.list('residents');
      let filtered = allResidents.filter(r => {
        if (!activeSearch) return true;
        const s = activeSearch.toLowerCase();
        return (r.nama || '').toLowerCase().includes(s) ||
               (r.alamat || '').toLowerCase().includes(s) ||
               (r.noHp || '').includes(s) ||
               (r.id || '').toLowerCase().includes(s);
      });
      const activeCount = allResidents.filter(r => r.status === 'Aktif').length;

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-black font-display text-on-surface">Data Induk Warga & KK</h2>
              <p class="text-xs text-slate-500">Registrasi kependudukan dan penanggung jawab kewajiban iuran lingkungan</p>
            </div>
            <div class="flex items-center gap-2">
              ${(window.KasRT.Auth && window.KasRT.Auth.Permissions.has('manage_residents')) ? `
                <button onclick="KasRT.Pages.Residents.openAddModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 cursor-pointer">
                  <span class="material-symbols-outlined text-base">person_add</span>
                  <span>Tambah Warga Baru</span>
                </button>
              ` : `
                <span class="px-3 py-1.5 rounded-xl bg-surface-container text-slate-500 font-semibold text-xs flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                  <span>Mode Baca (Khusus Bendahara/Petugas)</span>
                </span>
              `}
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Total Kepala Keluarga</span>
              <div class="text-lg font-black font-mono text-on-surface mt-0.5">${allResidents.length} KK</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-emerald-600 uppercase">Warga Aktif</span>
              <div class="text-lg font-black font-mono text-emerald-600 mt-0.5">${activeCount} KK</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Nonaktif / Pindah</span>
              <div class="text-lg font-black font-mono text-slate-500 mt-0.5">${allResidents.length - activeCount} KK</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-primary uppercase">Kelengkapan Kontak</span>
              <div class="text-lg font-black font-mono text-primary mt-0.5">${Math.round((allResidents.filter(r => r.noHp).length / (allResidents.length || 1)) * 100)}%</div>
            </div>
          </div>

          <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant flex items-center justify-between gap-4 shadow-sm">
            <div class="relative flex-1 max-w-md">
              <input type="text" placeholder="Cari nama warga, nomor HP, atau alamat..." value="${activeSearch}" oninput="KasRT.Pages.Residents.handleSearch(this.value)" class="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs focus:ring-1 focus:ring-primary" />
              <span class="material-symbols-outlined text-slate-400 text-sm absolute left-3 top-2.5">search</span>
            </div>
            <span class="text-xs text-slate-400 font-medium">Menampilkan ${filtered.length} dari ${allResidents.length} warga</span>
          </div>

          <div class="bg-surface-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left min-w-[620px]">
              <thead class="bg-surface-container/60 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant tracking-wider">
                <tr>
                  <th class="py-3 px-4">Nama Lengkap & ID</th>
                  <th class="py-3 px-4">Alamat Rumah</th>
                  <th class="py-3 px-4">Kontak / WhatsApp</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/40">
                ${filtered.length === 0 ? `
                  <tr><td colspan="5" class="py-12 text-center text-slate-400 italic">Data warga tidak ditemukan.</td></tr>
                ` : filtered.map(r => `
                  <tr class="hover:bg-surface-container/30 transition-colors">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-2xl bg-theme-gradient text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          ${Utils.initials(r.nama)}
                        </div>
                        <div>
                          <div class="font-bold text-on-surface text-sm">${r.nama}</div>
                          <span class="text-[10px] font-mono text-slate-400">${r.id}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-300">${r.alamat || '-'}</td>
                    <td class="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">${r.noHp || '-'}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
                        ${r.status}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex items-center justify-center gap-1">
                        ${(window.KasRT.Auth && window.KasRT.Auth.Permissions.has('manage_residents')) ? `
                          <button onclick="KasRT.Pages.Residents.openEditModal('${r.id}')" title="Ubah Data" class="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-surface-container cursor-pointer">
                            <span class="material-symbols-outlined text-base">edit</span>
                          </button>
                        ` : ''}
                        ${(window.KasRT.Auth && window.KasRT.Auth.Permissions.isAdmin()) ? `
                          <button onclick="KasRT.Pages.Residents.handleCascadeDelete('${r.id}')" title="Hapus Permanen (Superadmin)" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer">
                            <span class="material-symbols-outlined text-base">delete_forever</span>
                          </button>
                        ` : ''}
                      </div>
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

    handleSearch: Utils.debounce((val) => {
      activeSearch = val;
      window.KasRT.Events.handleRouting();
    }, 150),

    openAddModal() {
      const db = window.KasRT.DB;
      const settings = db.get('settings', 'global') || {};
      const autoId = db.nextId('WRG', 'residents');
      const defaultAlamat = settings.alamat || 'Jl. Merpati Blok B';

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div>
              <h3 class="text-base font-bold font-display text-on-surface">Pendaftaran Warga Baru</h3>
              <p class="text-xs text-slate-500">ID otomatis: <strong class="font-mono text-primary">${autoId}</strong></p>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Residents.handleSubmitAdd(event, '${autoId}')" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1 text-on-surface">Nama Lengkap Kepala Keluarga <span class="text-rose-500">*</span></label>
              <input type="text" id="res-nama" required placeholder="Contoh: Budi Santoso" class="w-full px-3.5 py-2.5 rounded-xl border-2 border-primary/40 focus:border-primary bg-surface-lowest text-sm font-semibold" autofocus />
            </div>
            <div>
              <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Alamat Tempat Tinggal (Opsional)</label>
              <input type="text" id="res-alamat" value="${defaultAlamat}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">No. HP / WhatsApp (Opsional)</label>
                <input type="tel" id="res-phone" placeholder="08123456789" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
              </div>
              <div>
                <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Status Tempat Tinggal</label>
                <select id="res-status" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                  <option value="Aktif">Warga Tetap Aktif</option>
                  <option value="Kontrak">Warga Kontrak / Sewa</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Catatan Khusus (Opsional)</label>
              <input type="text" id="res-notes" placeholder="Pemilik rumah Blok B..." class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Daftarkan Warga</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitAdd(e, id) {
      e.preventDefault();
      const nama = document.getElementById('res-nama')?.value;
      const alamat = document.getElementById('res-alamat')?.value;
      const noHp = document.getElementById('res-phone')?.value;
      const status = document.getElementById('res-status')?.value || 'Aktif';
      const catatan = document.getElementById('res-notes')?.value;

      const doc = {
        id,
        nama: nama.trim(),
        alamat: alamat.trim(),
        noHp: noHp.trim(),
        status,
        catatan: catatan.trim(),
        createdAt: Utils.nowISO(),
        updatedAt: Utils.nowISO()
      };

      await window.KasRT.DB.set('residents', doc);
      await window.KasRT.DB.log(window.KasRT.Auth?.user?.id || 'sys', 'CREATE_RESIDENT', 'residents', id, null, doc);
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast(`Warga ${nama} berhasil didaftarkan!`, 'success');
        window.KasRT.UI.closeModal();
      }
      window.KasRT.Events.handleRouting();
    },

    openEditModal(id) {
      const db = window.KasRT.DB;
      const r = db.get('residents', id);
      if (!r) return;

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Ubah Data Warga (${r.id})</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Residents.handleSubmitEdit(event, '${r.id}')" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Nama Lengkap</label>
              <input type="text" id="edit-res-nama" value="${r.nama}" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-bold mb-1">Alamat Rumah</label>
              <input type="text" id="edit-res-alamat" value="${r.alamat || ''}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">No. HP / WhatsApp</label>
                <input type="tel" id="edit-res-phone" value="${r.noHp || ''}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
              </div>
              <div>
                <label class="block font-bold mb-1">Status Kependudukan</label>
                <select id="edit-res-status" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                  <option value="Aktif" ${r.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                  <option value="Pindah" ${r.status === 'Pindah' ? 'selected' : ''}>Pindah Keluar RT</option>
                  <option value="Nonaktif" ${r.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">Catatan</label>
              <input type="text" id="edit-res-notes" value="${r.catatan || ''}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
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
      const nama = document.getElementById('edit-res-nama')?.value;
      const alamat = document.getElementById('edit-res-alamat')?.value;
      const noHp = document.getElementById('edit-res-phone')?.value;
      const status = document.getElementById('edit-res-status')?.value;
      const catatan = document.getElementById('edit-res-notes')?.value;

      await window.KasRT.DB.update('residents', id, {
        nama: nama.trim(),
        alamat: alamat.trim(),
        noHp: noHp.trim(),
        status,
        catatan: catatan.trim()
      });

      if (window.KasRT.UI) {
        window.KasRT.UI.showToast('Data warga berhasil diperbarui!', 'success');
        window.KasRT.UI.closeModal();
      }
      window.KasRT.Events.handleRouting();
    },

    async handleCascadeDelete(residentId) {
      const db = window.KasRT.DB;
      const res = db.get('residents', residentId);
      if (!res) return;

      const bills = db.list('duesBills').filter(b => b.residentId === residentId);
      const payments = db.list('duesPayments').filter(p => p.residentId === residentId);
      const plans = db.list('installmentPlans').filter(p => p.residentId === residentId);

      const promptRes = await window.KasRT.UI.promptInputModal({
        title: `Hapus Permanen Warga & Cascade Data`,
        message: `PERINGATAN SUPERADMIN: Tindakan ini akan menghapus data warga "${res.nama}" beserta seluruh ${bills.length} tagihan iuran, ${payments.length} riwayat setoran, dan ${plans.length} rencana cicilan yang terkait.`,
        requiredText: 'HAPUS',
        danger: true
      });

      if (promptRes === 'HAPUS') {
        const planIds = plans.map(p => p.id);
        const allocs = db.list('paymentAllocations').filter(a => planIds.includes(a.planId));
        await db.removeCollection('paymentAllocations', allocs.map(a => a.id));
        const schedules = db.list('installmentSchedules').filter(s => planIds.includes(s.planId));
        await db.removeCollection('installmentSchedules', schedules.map(s => s.id));
        await db.removeCollection('installmentPlans', planIds);
        await db.removeCollection('duesBills', bills.map(b => b.id));
        await db.removeCollection('duesPayments', payments.map(p => p.id));
        await db.remove('residents', residentId);

        await db.log(window.KasRT.Auth?.user?.id || 'sys', 'ADMIN_CASCADE_DELETE_RESIDENT', 'residents', residentId, res, {
          cascadeCounts: {
            bills: bills.length,
            payments: payments.length,
            plans: plans.length,
            schedules: schedules.length,
            allocations: allocs.length
          }
        });

        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Data warga ${res.nama} dan seluruh catatan terkait berhasil dihapus secara bersih.`, 'info');
        }
        window.KasRT.Events.handleRouting();
      }
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.Residents = ResidentsPage;
  window.KasRT_Pages_Residents_Loaded = true;
})();
