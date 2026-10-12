/**
 * KasRT - Inventory Views Engine (6 Sub-Routes + Inventory Reports)
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_Inventory_Loaded) return;

  const Utils = window.KasRT.Utils;

  const InventoryPages = {
    renderCategories() {
      return this.renderCategoryList();
    },
    renderOfficers() {
      return this.renderOfficerList();
    },
    renderTeams() {
      return this.renderTeamList();
    },
    renderSchedules() {
      return this.renderScheduleList();
    },
    renderPhysicalChecks() {
      return this.renderCheckForm();
    },
    renderCitizenInventoryView() {
      return this.renderItemList();
    },
    renderItemList() {
      const db = window.KasRT.DB;
      const items = db.list('inventoryItems');
      const categories = db.list('inventoryCategories');
      const totBaik = items.reduce((s, i) => s + (i.jumlahBaik || 0), 0);
      const totCacat = items.reduce((s, i) => s + (i.jumlahCacat || 0), 0);
      const now = Date.now();

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-black font-display text-on-surface">Inventaris & Perlengkapan RT</h2>
              <p class="text-xs text-slate-500">Pencatatan aset fisik, tenda, kursi, alat gotong royong, dan peralatan keamanan</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              ${(window.KasRT.Auth && window.KasRT.Auth.Permissions.has('perform_inventory_check')) ? `
                <a href="#/app/inventaris-pengecekan" class="px-3.5 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-surface-container">
                  <span class="material-symbols-outlined text-base">fact_check</span>
                  <span>Mulai Pengecekan Fisik</span>
                </a>
              ` : ''}
              ${(window.KasRT.Auth && window.KasRT.Auth.Permissions.has('manage_inventory')) ? `
                <button onclick="KasRT.Pages.Inventory.openAddItemModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 cursor-pointer">
                  <span class="material-symbols-outlined text-base">add</span>
                  <span>Barang Baru</span>
                </button>
              ` : ''}
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Macam Barang</span>
              <div class="text-lg font-black font-mono text-on-surface mt-0.5">${items.length} Jenis</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-emerald-600 uppercase">Kondisi Baik</span>
              <div class="text-lg font-black font-mono text-emerald-600 mt-0.5">${totBaik} Unit</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-rose-600 uppercase">Rusak / Cacat</span>
              <div class="text-lg font-black font-mono text-rose-600 mt-0.5">${totCacat} Unit</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-primary uppercase">Total Unit Fisik</span>
              <div class="text-lg font-black font-mono text-primary mt-0.5">${totBaik + totCacat} Unit</div>
            </div>
          </div>

          <div class="bg-surface-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left min-w-[650px]">
              <thead class="bg-surface-container/60 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant tracking-wider">
                <tr>
                  <th class="py-3 px-4">Nama Barang & ID</th>
                  <th class="py-3 px-4">Kategori</th>
                  <th class="py-3 px-4 text-right">Baik</th>
                  <th class="py-3 px-4 text-right">Cacat</th>
                  <th class="py-3 px-4 text-right">Total</th>
                  <th class="py-3 px-4">Terakhir Cek</th>
                  <th class="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/40">
                ${items.map(item => {
                  const cat = categories.find(c => c.id === item.categoryId);
                  const isStale = item.lastCheckedAt && (now - new Date(item.lastCheckedAt).getTime()) / (1000 * 3600 * 24) > 30;
                  return `
                    <tr class="hover:bg-surface-container/30 transition-colors">
                      <td class="py-3 px-4">
                        <div class="font-bold text-sm text-on-surface">${item.nama}</div>
                        <div class="text-[10px] font-mono text-slate-400">${item.id} | ${item.keterangan || '-'}</div>
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-slate-600 dark:text-slate-300">${cat ? cat.nama : '-'}</span>
                      </td>
                      <td class="py-3 px-4 text-right font-mono font-bold text-emerald-600">${item.jumlahBaik}</td>
                      <td class="py-3 px-4 text-right font-mono font-bold text-rose-600">${item.jumlahCacat}</td>
                      <td class="py-3 px-4 text-right font-mono font-black">${(item.jumlahBaik || 0) + (item.jumlahCacat || 0)}</td>
                      <td class="py-3 px-4 whitespace-nowrap">
                        <span class="font-mono ${isStale ? 'text-amber-600 font-bold' : 'text-slate-500'}">${Utils.formatDate(item.lastCheckedAt)}</span>
                        ${isStale ? `<span class="block text-[9px] text-amber-500 font-semibold">⚠ >30 hari</span>` : ''}
                      </td>
                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1">
                          ${(window.KasRT.Auth && window.KasRT.Auth.Permissions.has('manage_inventory')) ? `
                            <button onclick="KasRT.Pages.Inventory.openEditItemModal('${item.id}')" title="Ubah" class="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-surface-container cursor-pointer">
                              <span class="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button onclick="KasRT.Pages.Inventory.handleDeleteItem('${item.id}')" title="Hapus" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer">
                              <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                          ` : `
                            <span class="text-[10px] text-slate-400 font-medium">Hanya Lihat</span>
                          `}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      `;
    },

    renderCategoryList() {
      const db = window.KasRT.DB;
      const cats = db.list('inventoryCategories');
      const items = db.list('inventoryItems');

      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <a href="#/app/inventaris" class="text-xs font-semibold text-primary hover:underline">← Kembali ke Inventaris</a>
              </div>
              <h2 class="text-xl font-black font-display text-on-surface">Kategori Perlengkapan & Aset</h2>
              <p class="text-xs text-slate-500">Pengelompokan jenis barang untuk memudahkan audit dan peminjaman warga</p>
            </div>
            <button onclick="KasRT.Pages.Inventory.openAddCatModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-md cursor-pointer">
              + Kategori Baru
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${cats.map(c => {
              const count = items.filter(i => i.categoryId === c.id).length;
              return `
                <div class="p-5 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex items-center justify-between">
                  <div class="flex items-center gap-3.5">
                    <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm" style="background-color: ${c.warna}">
                      <span class="material-symbols-outlined text-2xl">${c.icon}</span>
                    </div>
                    <div>
                      <h3 class="font-bold text-sm text-on-surface">${c.nama}</h3>
                      <p class="text-[11px] text-slate-500">${c.deskripsi || ''}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-base font-black font-mono text-primary">${count}</span>
                    <span class="block text-[10px] text-slate-400">Jenis</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    renderOfficerList() {
      const db = window.KasRT.DB;
      const officers = db.list('inventoryOfficers');

      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <a href="#/app/inventaris" class="text-xs font-semibold text-primary hover:underline">← Kembali ke Inventaris</a>
              </div>
              <h2 class="text-xl font-black font-display text-on-surface">Petugas & Pengelola Inventaris</h2>
              <p class="text-xs text-slate-500">Warga yang ditunjuk sebagai penanggung jawab gudang dan opname fisik</p>
            </div>
            <button onclick="KasRT.Pages.Inventory.openAddOfficerModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-md cursor-pointer">
              + Tunjuk Petugas Baru
            </button>
          </div>
          <div class="bg-surface-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left min-w-[550px]">
              <thead class="bg-surface-container/60 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant">
                <tr>
                  <th class="py-3 px-4">Nama Petugas</th>
                  <th class="py-3 px-4">Jabatan</th>
                  <th class="py-3 px-4">Kontak / WA</th>
                  <th class="py-3 px-4">Periode Amanah</th>
                  <th class="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/40">
                ${officers.map(o => `
                  <tr>
                    <td class="py-3 px-4 font-bold text-on-surface">${o.nama}</td>
                    <td class="py-3 px-4 text-primary font-semibold">${o.jabatan}</td>
                    <td class="py-3 px-4 font-mono">${o.noHp || '-'}</td>
                    <td class="py-3 px-4 font-mono text-slate-500">${Utils.formatDate(o.periodeMulai)} s.d. ${Utils.formatDate(o.periodeSelesai)}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">${o.status}</span>
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

    renderTeamList() {
      const db = window.KasRT.DB;
      const groups = db.list('inventoryGroups');
      const officers = db.list('inventoryOfficers');

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <a href="#/app/inventaris" class="text-xs font-semibold text-primary hover:underline">← Kembali ke Inventaris</a>
              </div>
              <h2 class="text-xl font-black font-display text-on-surface">Tim Pengecekan Fisik Aset</h2>
              <p class="text-xs text-slate-500">Pembagian kelompok petugas opname berimbang (Balancing Engine)</p>
            </div>
            <button onclick="KasRT.Pages.Inventory.openGenerateTeamsModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer">
              <span class="material-symbols-outlined text-base">auto_fix_high</span>
              <span>Generate Tim Berimbang</span>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${groups.map(g => {
              const ketua = officers.find(o => o.id === g.ketuaId);
              return `
                <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style="background-color: ${g.warna}">
                        <span class="material-symbols-outlined text-xl">${g.icon}</span>
                      </div>
                      <div>
                        <h3 class="font-bold text-sm text-on-surface">${g.nama}</h3>
                        <p class="text-[11px] text-slate-500">${g.deskripsi || ''}</p>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">${g.status}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ketua Kelompok:</span>
                    <span class="font-bold text-xs text-on-surface">${ketua ? ketua.nama : 'Belum Ditunjuk'}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Anggota Tim:</span>
                    <div class="flex flex-wrap gap-1.5">
                      ${(g.memberIds || []).map(mId => {
                        const m = officers.find(o => o.id === mId);
                        return `
                          <span class="px-2.5 py-1 rounded-xl bg-surface-container text-slate-700 dark:text-slate-300 text-xs font-semibold">
                            ${m ? m.nama : mId}
                          </span>
                        `;
                      }).join('')}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    renderScheduleList() {
      const db = window.KasRT.DB;
      const schedules = db.list('inventorySchedules');

      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <a href="#/app/inventaris" class="text-xs font-semibold text-primary hover:underline">← Kembali ke Inventaris</a>
              </div>
              <h2 class="text-xl font-black font-display text-on-surface">Jadwal Pemeriksaan Fisik (Opname)</h2>
              <p class="text-xs text-slate-500">Kalender agenda pemeriksaan berkala inventaris balai dan pos ronda</p>
            </div>
            <button onclick="KasRT.Pages.Inventory.openAddScheduleModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-md cursor-pointer">
              + Buat Agenda Baru
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${schedules.map(s => `
              <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">${s.frekuensi}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${s.status}</span>
                  </div>
                  <h3 class="font-bold text-base text-on-surface">${s.judul}</h3>
                  <p class="text-xs text-slate-500 mt-1">${s.catatan || 'Pemeriksaan rutin berkala'}</p>
                </div>
                <div class="pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-slate-400 block uppercase font-semibold">Pelaksanaan:</span>
                    <span class="font-bold text-xs text-on-surface font-mono">${Utils.formatDate(s.tanggalPengecekan)}</span>
                  </div>
                  <a href="#/app/inventaris-pengecekan?scheduleId=${s.id}" class="px-3 py-1.5 rounded-xl bg-theme-gradient text-white text-xs font-bold hover:opacity-90">
                    Mulai Cek
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    renderCheckForm() {
      const db = window.KasRT.DB;
      const items = db.list('inventoryItems');
      const auth = window.KasRT.Auth;

      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <a href="#/app/inventaris" class="text-xs font-semibold text-primary hover:underline">← Kembali ke Inventaris</a>
              </div>
              <h2 class="text-xl font-black font-display text-on-surface">Formulir Pengecekan Fisik (Stock Opname)</h2>
              <p class="text-xs text-slate-500">Hitung jumlah fisik barang nyata di gudang dan catat jika ada kerusakan atau selisih</p>
            </div>
            <button onclick="KasRT.Pages.Inventory.finalizeCheck()" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:opacity-90 cursor-pointer">
              Finalisasi Hasil Opname
            </button>
          </div>
          <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant flex flex-wrap items-center gap-4 text-xs">
            <div>
              <label class="block font-bold mb-1 text-slate-500">Nama Petugas Pemeriksa:</label>
              <input type="text" id="chk-officer" value="${auth?.user?.nama || 'Petugas Inventaris'}" class="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest font-semibold" />
            </div>
            <div class="flex-1">
              <label class="block font-bold mb-1 text-slate-500">Catatan Umum Pemeriksaan:</label>
              <input type="text" id="chk-notes" placeholder="Seluruh tenda dan kursi sudah dihitung ulang di gudang balai..." class="w-full px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
          </div>
          <div class="bg-surface-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left min-w-[600px]">
              <thead class="bg-surface-container/60 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant">
                <tr>
                  <th class="py-3 px-4">Barang</th>
                  <th class="py-3 px-4 text-center">Fisik Baik</th>
                  <th class="py-3 px-4 text-center">Fisik Cacat</th>
                  <th class="py-3 px-4">Keterangan Koreksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/40">
                ${items.map(item => `
                  <tr data-item-id="${item.id}" class="hover:bg-surface-container/30">
                    <td class="py-3 px-4">
                      <div class="font-bold text-sm text-on-surface">${item.nama}</div>
                      <span class="text-[10px] text-slate-400">Tercatat di sistem: ${item.jumlahBaik} Baik / ${item.jumlahCacat} Cacat</span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <input type="number" class="chk-item-baik w-20 px-2 py-1 rounded-lg border border-outline-variant bg-surface-lowest text-center font-mono font-bold" value="${item.jumlahBaik}" min="0" />
                    </td>
                    <td class="py-3 px-4 text-center">
                      <input type="number" class="chk-item-cacat w-20 px-2 py-1 rounded-lg border border-outline-variant bg-surface-lowest text-center font-mono font-bold text-rose-600" value="${item.jumlahCacat}" min="0" />
                    </td>
                    <td class="py-3 px-4">
                      <input type="text" class="chk-item-notes w-full px-3 py-1 rounded-lg border border-outline-variant bg-surface-lowest text-xs" placeholder="Kondisi baut/kain..." />
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

    async finalizeCheck() {
      const officer = document.getElementById('chk-officer')?.value;
      const notes = document.getElementById('chk-notes')?.value;
      const rows = document.querySelectorAll('tr[data-item-id]');
      const items = [];
      rows.forEach(r => {
        const itemId = r.getAttribute('data-item-id');
        const baik = parseInt(r.querySelector('.chk-item-baik')?.value || 0, 10);
        const cacat = parseInt(r.querySelector('.chk-item-cacat')?.value || 0, 10);
        const catatan = r.querySelector('.chk-item-notes')?.value || '';
        items.push({ itemId, jumlahBaik: baik, jumlahCacat: cacat, catatan });
      });

      try {
        const res = await window.KasRT.Features.Inventory.finalizeCheck({
          petugasNama: officer,
          catatanUmum: notes,
          items
        });
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Pengecekan fisik berhasil difinalisasi (${res.ringkasan.totalItem} item diperiksa).`, 'success');
        }
        window.KasRT.Events.navigate('#/app/inventaris');
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    renderReportList() {
      const catalog = window.KasRT.Reports.Catalog.listByGroup('Inventaris');
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <a href="#/app/inventaris" class="text-xs font-semibold text-primary hover:underline">← Kembali ke Inventaris</a>
              </div>
              <h2 class="text-xl font-black font-display text-on-surface">Katalog Laporan Inventaris & Aset RT</h2>
              <p class="text-xs text-slate-500">10 Format laporan resmi siap cetak dan ekspor (INV-01 s.d. INV-10)</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${catalog.map(r => `
              <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex flex-col justify-between hover:border-primary transition-all">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <span class="material-symbols-outlined text-xl">${r.icon}</span>
                    </div>
                    <span class="font-mono text-xs font-bold text-slate-400">${r.code}</span>
                  </div>
                  <h3 class="font-bold text-sm text-on-surface">${r.name}</h3>
                  <p class="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">${r.desc}</p>
                </div>
                <div class="pt-3 border-t border-outline-variant/60">
                  <button onclick="KasRT.Reports.Export.showPreviewModal('${r.code}')" class="w-full py-2 rounded-xl bg-theme-gradient text-white text-xs font-bold shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer">
                    <span class="material-symbols-outlined text-base">visibility</span>
                    <span>Buka Pratinjau Laporan</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    openAddItemModal() {
      const db = window.KasRT.DB;
      const cats = db.list('inventoryCategories');
      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Tambah Barang Inventaris Baru</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Inventory.handleSubmitAddItem(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Nama Barang</label>
              <input type="text" id="inv-nama" required placeholder="Contoh: Lampu Sorot LED 100W" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-sm" />
            </div>
            <div>
              <label class="block font-bold mb-1">Kategori Barang</label>
              <select id="inv-cat" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                ${cats.map(c => `<option value="${c.id}">${c.nama}</option>`).join('')}
              </select>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Jumlah Kondisi Baik</label>
                <input type="number" id="inv-baik" value="1" min="0" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">Jumlah Rusak / Cacat</label>
                <input type="number" id="inv-cacat" value="0" min="0" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono font-bold" />
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">Lokasi Penyimpanan / Catatan</label>
              <input type="text" id="inv-notes" placeholder="Gudang balai RT rak 2..." class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan Barang</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitAddItem(e) {
      e.preventDefault();
      try {
        const nama = document.getElementById('inv-nama')?.value;
        const categoryId = document.getElementById('inv-cat')?.value;
        const jumlahBaik = document.getElementById('inv-baik')?.value;
        const jumlahCacat = document.getElementById('inv-cacat')?.value;
        const keterangan = document.getElementById('inv-notes')?.value;
        await window.KasRT.Features.Inventory.addItem({
          nama, categoryId, jumlahBaik, jumlahCacat, keterangan
        });
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Barang "${nama}" berhasil didaftarkan ke inventaris!`, 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    openEditItemModal(id) {
      const db = window.KasRT.DB;
      const item = db.get('inventoryItems', id);
      if (!item) return;
      const cats = db.list('inventoryCategories');

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Ubah Barang Inventaris</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Inventory.handleSubmitEditItem(event, '${item.id}')" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Nama Barang</label>
              <input type="text" id="edit-inv-nama" value="${item.nama}" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-bold mb-1">Kategori</label>
              <select id="edit-inv-cat" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                ${cats.map(c => `<option value="${c.id}" ${c.id === item.categoryId ? 'selected' : ''}>${c.nama}</option>`).join('')}
              </select>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Jumlah Baik</label>
                <input type="number" id="edit-inv-baik" value="${item.jumlahBaik}" min="0" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
              </div>
              <div>
                <label class="block font-bold mb-1">Jumlah Rusak / Cacat</label>
                <input type="number" id="edit-inv-cacat" value="${item.jumlahCacat}" min="0" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">Keterangan / Lokasi</label>
              <input type="text" id="edit-inv-notes" value="${item.keterangan || ''}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
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

    async handleSubmitEditItem(e, id) {
      e.preventDefault();
      try {
        const nama = document.getElementById('edit-inv-nama')?.value;
        const categoryId = document.getElementById('edit-inv-cat')?.value;
        const jumlahBaik = parseInt(document.getElementById('edit-inv-baik')?.value || 0, 10);
        const jumlahCacat = parseInt(document.getElementById('edit-inv-cacat')?.value || 0, 10);
        const keterangan = document.getElementById('edit-inv-notes')?.value;
        await window.KasRT.Features.Inventory.updateItem(id, {
          nama, categoryId, jumlahBaik, jumlahCacat, keterangan
        });
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Data barang berhasil diperbarui!', 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    async handleDeleteItem(id) {
      const confirm = await window.KasRT.UI.confirmModal({
        title: 'Hapus Barang Inventaris',
        message: 'Apakah Anda yakin ingin menghapus barang aset ini dari buku induk?',
        danger: true
      });
      if (confirm) {
        await window.KasRT.Features.Inventory.deleteItem(id);
        if (window.KasRT.UI) window.KasRT.UI.showToast('Barang berhasil dihapus.', 'info');
        window.KasRT.Events.handleRouting();
      }
    },

    openAddOfficerModal() {
      const db = window.KasRT.DB;
      const residents = db.list('residents').filter(r => r.status === 'Aktif');
      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Tunjuk Petugas Inventaris Baru</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Inventory.handleSubmitAddOfficer(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Pilih Warga</label>
              ${window.KasRT.UI.ResidentPicker.render({
                id: 'off-resident',
                placeholder: 'Ketik nama warga untuk mencari...',
                required: true,
                residents
              })}
            </div>
            <div>
              <label class="block font-bold mb-1">Jabatan / Tanggung Jawab</label>
              <input type="text" id="off-jabatan" value="Koordinator Perlengkapan" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan Petugas</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'sm' });
    },

    async handleSubmitAddOfficer(e) {
      e.preventDefault();
      try {
        const db = window.KasRT.DB;
        const residentId = document.getElementById('off-resident')?.value;
        if (!residentId) {
          throw new Error('Silakan pilih nama warga dari daftar pencarian warga.');
        }
        const res = db.get('residents', residentId);
        const jabatan = document.getElementById('off-jabatan')?.value;
        await window.KasRT.Features.Inventory.addOfficer({
          residentId,
          nama: res ? res.nama : 'Petugas',
          noHp: res ? res.noHp : '',
          alamat: res ? res.alamat : '',
          jabatan
        });
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Petugas inventaris berhasil ditunjuk!', 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    openGenerateTeamsModal() {
      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Generate Tim Berimbang Otomatis</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <div class="space-y-4 text-xs">
            <p class="text-slate-500">Engine penyeimbang akan mengacak petugas yang ada ke dalam jumlah tim yang setara.</p>
            <div>
              <label class="block font-bold mb-1">Target Jumlah Kelompok (Tim)</label>
              <select id="team-count" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                <option value="2" selected>2 Kelompok (Tim A & Tim B)</option>
                <option value="3">3 Kelompok (Tim A, B, C)</option>
                <option value="4">4 Kelompok</option>
              </select>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button onclick="KasRT.Pages.Inventory.executeGenerateTeams()" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Generate Sekarang</button>
            </div>
          </div>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'sm' });
    },

    async executeGenerateTeams() {
      const count = parseInt(document.getElementById('team-count')?.value || 2, 10);
      const db = window.KasRT.DB;
      const officers = db.list('inventoryOfficers');
      const groups = window.KasRT.Features.Inventory.generateBalancedGroups(officers, 'count', count, true);
      db.cache.inventoryGroups = groups;
      db.persistDemo();
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast(`Berhasil membentuk ${groups.length} kelompok tim terdistribusi!`, 'success');
        window.KasRT.UI.closeModal();
      }
      window.KasRT.Events.handleRouting();
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.Inventory = InventoryPages;
  window.KasRT_Pages_Inventory_Loaded = true;
})();
