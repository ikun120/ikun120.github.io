/**
 * KasRT - Users & Roles Management Page
 * Manajemen akun pengguna (#/app/users) dan matriks izin RBAC (#/app/roles) dengan proteksi anti-lockout
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_UsersRoles_Loaded) return;

  const Utils = window.KasRT.Utils;
  let activeUserSearch = '';
  let activeRoleFilter = 'all';
  let activeRoleSearch = '';

  const UsersRolesPage = {
    renderUsers() {
      const auth = window.KasRT.Auth;
      if (!auth || !auth.Permissions.has('manage_users')) {
        return window.KasRT.Shell.renderForbidden('manage_users', '/app/users');
      }
      const db = window.KasRT.DB;
      const users = db.list('users');
      let filtered = users.filter(u => {
        if (!activeUserSearch) return true;
        const s = activeUserSearch.toLowerCase();
        return (u.nama || '').toLowerCase().includes(s) ||
               (u.email || '').toLowerCase().includes(s) ||
               (u.username || '').toLowerCase().includes(s) ||
               (u.roles || []).some(r => r.toLowerCase().includes(s));
      });
      const activeCount = users.filter(u => u.status === 'Aktif').length;

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-black font-display text-on-surface">Manajemen Pengguna Sistem</h2>
              <p class="text-xs text-slate-500">Kelola akun pengurus RT, koordinator seksi, dan akses portal warga</p>
            </div>
            <div class="flex items-center gap-2">
              <a href="#/app/roles" class="px-3.5 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-surface-container">
                <span class="material-symbols-outlined text-base">security</span>
                <span>Matriks Role & Izin</span>
              </a>
              <button onclick="KasRT.Pages.UsersRoles.openAddUserModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 cursor-pointer">
                <span class="material-symbols-outlined text-base">person_add</span>
                <span>Pengguna Baru</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Total Akun</span>
              <div class="text-lg font-black font-mono text-on-surface mt-0.5">${users.length} User</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-emerald-600 uppercase">Status Aktif</span>
              <div class="text-lg font-black font-mono text-emerald-600 mt-0.5">${activeCount} Akun</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Nonaktif</span>
              <div class="text-lg font-black font-mono text-slate-500 mt-0.5">${users.length - activeCount} Akun</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-primary uppercase">Tingkat Administrator</span>
              <div class="text-lg font-black font-mono text-primary mt-0.5">${users.filter(u => u.roles && u.roles.includes('Admin')).length} Admin</div>
            </div>
          </div>

          <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant flex items-center justify-between gap-4 shadow-sm">
            <div class="relative flex-1 max-w-md">
              <input type="text" placeholder="Cari nama, email, username, atau role..." value="${activeUserSearch}" oninput="KasRT.Pages.UsersRoles.handleSearch(this.value)" class="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs focus:ring-1 focus:ring-primary" />
              <span class="material-symbols-outlined text-slate-400 text-sm absolute left-3 top-2.5">search</span>
            </div>
          </div>

          <div class="bg-surface-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left min-w-[650px]">
              <thead class="bg-surface-container/60 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant tracking-wider">
                <tr>
                  <th class="py-3 px-4">Pengguna</th>
                  <th class="py-3 px-4">Username & Kontak</th>
                  <th class="py-3 px-4">Peran (Roles)</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/40">
                ${filtered.map(u => {
                  const isCurrent = window.KasRT.Auth?.user?.id === u.id;
                  return `
                    <tr class="hover:bg-surface-container/30 transition-colors">
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-3">
                          ${(window.KasRT && window.KasRT.UI && window.KasRT.UI.renderAvatar)
                            ? window.KasRT.UI.renderAvatar(u, 36)
                            : `<div class="w-9 h-9 rounded-2xl bg-theme-gradient text-white font-bold flex items-center justify-center text-xs shadow-xs">${Utils.initials(u.nama)}</div>`}
                          <div>
                            <div class="font-bold text-on-surface text-sm flex items-center gap-1.5">
                              <span>${u.nama}</span>
                              ${isCurrent ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary text-white">Anda</span>` : ''}
                            </div>
                            <span class="text-[11px] text-slate-400">${u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="font-mono text-slate-600 dark:text-slate-300">@${u.username}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${u.noHp || '-'}</div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex flex-wrap gap-1.5">
                          ${(u.roles || []).map(r => {
                            const roleObj = window.KasRT.Auth?.Permissions?.roleById(r);
                            const roleName = roleObj ? roleObj.name : r;
                            const roleColor = roleObj ? roleObj.color : '#64748b';
                            const roleIcon = roleObj ? roleObj.icon : 'badge';
                            return `
                              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-2xs" style="background-color: ${roleColor}1a; color: ${roleColor}; border: 1px solid ${roleColor}33">
                                <span class="material-symbols-outlined text-[13px]">${roleIcon}</span>
                                <span>${roleName}</span>
                              </span>
                            `;
                          }).join('')}
                        </div>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <button onclick="KasRT.Pages.UsersRoles.toggleStatus('${u.id}')" ${isCurrent ? 'disabled' : ''} class="px-2.5 py-1 rounded-full text-[10px] font-bold transition-transform hover:scale-105 cursor-pointer ${u.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                          ${u.status}
                        </button>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1">
                          <button onclick="KasRT.Pages.UsersRoles.openEditUserModal('${u.id}')" title="Ubah Akun" class="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-surface-container cursor-pointer">
                            <span class="material-symbols-outlined text-base">edit</span>
                          </button>
                          ${!isCurrent ? `
                            <button onclick="KasRT.Pages.UsersRoles.handleDeleteUser('${u.id}')" title="Hapus Akun" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer">
                              <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                          ` : ''}
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

    handleSearch: Utils.debounce((val) => {
      activeUserSearch = val;
      window.KasRT.Events.handleRouting();
    }, 150),

    renderRoles() {
      const auth = window.KasRT.Auth;
      if (!auth || !auth.Permissions.has('manage_roles')) {
        return window.KasRT.Shell.renderForbidden('manage_roles', '/app/roles');
      }
      const allRoles = window.KasRT.Auth.Permissions.roles();
      const users = window.KasRT.DB.list('users');

      let filteredRoles = allRoles.filter(r => {
        if (activeRoleFilter === 'system' && !r.isSystem) return false;
        if (activeRoleFilter === 'custom' && r.isSystem) return false;
        if (activeRoleFilter === 'overridden' && !r.hasOverride) return false;
        if (activeRoleSearch) {
          const s = activeRoleSearch.toLowerCase();
          const matchName = (r.name || '').toLowerCase().includes(s);
          const matchDesc = (r.description || '').toLowerCase().includes(s);
          const matchId = (r.id || '').toLowerCase().includes(s);
          const matchPerms = (r.permissions || []).some(p => p.toLowerCase().includes(s));
          return matchName || matchDesc || matchId || matchPerms;
        }
        return true;
      });

      const totalRoles = allRoles.length;
      const systemCount = allRoles.filter(r => r.isSystem).length;
      const customCount = allRoles.filter(r => !r.isSystem).length;
      const overrideCount = allRoles.filter(r => r.hasOverride).length;

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <a href="#/app/users" class="text-xs font-semibold text-primary hover:underline">← Kembali ke Pengguna</a>
              </div>
              <h2 class="text-xl font-black font-display text-on-surface">Role & Hak Akses (RBAC)</h2>
              <p class="text-xs text-slate-500">Kustomisasi wewenang peran default (Bendahara, Ketua RT, Petugas Lapangan, Inventaris, Sekretaris, Warga) atau buat peran kustom baru</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="KasRT.Pages.UsersRoles.openAddRoleModal()" class="px-4 py-2.5 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                <span class="material-symbols-outlined text-base">add_moderator</span>
                <span>+ Tambah Role Kustom</span>
              </button>
            </div>
          </div>

          <!-- Banner Informasi Kustomisasi Role -->
          <div class="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3">
            <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-xl mt-0.5">verified_user</span>
            <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p class="font-bold text-indigo-950 dark:text-indigo-200 text-xs">Fleksibilitas Penuh Hak Akses & Jabatan RT</p>
              <p class="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Administrator dapat mengubah nama peran, deskripsi tugas, ikon, warna, dan centang izin fitur untuk seluruh role bawaan (<strong>Bendahara RT, Ketua RT, Petugas Lapangan, Petugas Inventaris, Sekretaris RT, Warga RT</strong>) sesuai kebutuhan lingkungan RT Anda. Role yang telah diubah dapat dikembalikan ke bawaan sistem kapan saja.
              </p>
            </div>
          </div>

          <!-- Ringkasan Statistik Peran -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Total Role</span>
              <div class="text-lg font-black font-mono text-on-surface mt-0.5">${totalRoles} Peran</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-slate-500 uppercase">Role Bawaan</span>
              <div class="text-lg font-black font-mono text-slate-600 dark:text-slate-300 mt-0.5">${systemCount} Sistem</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-primary uppercase">Role Kustom</span>
              <div class="text-lg font-black font-mono text-primary mt-0.5">${customCount} Kustom</div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-amber-600 uppercase">Disesuaikan</span>
              <div class="text-lg font-black font-mono text-amber-600 mt-0.5">${overrideCount} Role</div>
            </div>
          </div>

          <!-- Filter Tabs & Pencarian -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface-lowest border border-outline-variant">
            <div class="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
              <button onclick="KasRT.Pages.UsersRoles.setRoleFilter('all')" class="px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${activeRoleFilter === 'all' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600 hover:bg-surface-container'}">
                Semua (${totalRoles})
              </button>
              <button onclick="KasRT.Pages.UsersRoles.setRoleFilter('system')" class="px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${activeRoleFilter === 'system' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600 hover:bg-surface-container'}">
                Bawaan Sistem (${systemCount})
              </button>
              <button onclick="KasRT.Pages.UsersRoles.setRoleFilter('custom')" class="px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${activeRoleFilter === 'custom' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600 hover:bg-surface-container'}">
                Role Kustom (${customCount})
              </button>
              <button onclick="KasRT.Pages.UsersRoles.setRoleFilter('overridden')" class="px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${activeRoleFilter === 'overridden' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-700 hover:bg-amber-50'}">
                Disesuaikan (${overrideCount})
              </button>
            </div>
            <div class="relative w-full sm:w-64">
              <input type="text" placeholder="Cari nama role atau izin..." value="${activeRoleSearch}" oninput="KasRT.Pages.UsersRoles.handleRoleSearch(this.value)" class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs focus:ring-1 focus:ring-primary" />
              <span class="material-symbols-outlined text-slate-400 text-sm absolute left-2.5 top-2">search</span>
            </div>
          </div>

          <!-- Grid Daftar Role -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${filteredRoles.length === 0 ? `
              <div class="col-span-full py-12 text-center bg-surface-lowest rounded-3xl border border-dashed border-outline-variant text-slate-400 text-xs">
                <span class="material-symbols-outlined text-4xl block mb-2 opacity-50">search_off</span>
                Tidak ada role yang sesuai dengan filter atau kata kunci pencarian.
              </div>
            ` : filteredRoles.map(r => {
              const userCount = users.filter(u => u.roles && u.roles.includes(r.id)).length;
              const perms = r.permissions || [];
              return `
                <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
                  <div>
                    <div class="flex items-start justify-between gap-2 mb-3">
                      <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105" style="background-color: ${r.color}">
                        <span class="material-symbols-outlined text-2xl">${r.icon}</span>
                      </div>
                      <div class="flex flex-col items-end gap-1">
                        <div class="flex items-center gap-1">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${r.isSystem ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-primary/10 text-primary border border-primary/20'}">
                            ${r.isSystem ? 'Sistem' : 'Kustom'}
                          </span>
                          ${r.hasOverride ? `
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-0.5" title="Pengaturan telah disesuaikan dari default">
                              <span class="material-symbols-outlined text-[11px]">tune</span>
                              <span>Disesuaikan</span>
                            </span>
                          ` : ''}
                        </div>
                        <span class="text-[10px] font-mono text-slate-400">${r.id}</span>
                      </div>
                    </div>
                    <h3 class="font-bold text-base text-on-surface flex items-center gap-1.5">
                      <span>${r.name}</span>
                    </h3>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed mb-4 line-clamp-2" title="${r.description}">${r.description}</p>
                    <div class="mb-4">
                      <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        <span>Izin Diberikan:</span>
                        <span class="${perms.includes('*') ? 'text-indigo-600 font-extrabold' : 'text-slate-600 dark:text-slate-300'} font-mono">${perms.includes('*') ? 'Wildcard (*)' : `${perms.length} Hak Akses`}</span>
                      </div>
                      <div class="flex flex-wrap gap-1">
                        ${perms.includes('*') ? `
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">Wildcard Superadmin (*)</span>
                        ` : perms.slice(0, 5).map(p => {
                          const pMeta = (window.KasRT.Constants.ALL_PERMISSIONS || []).find(x => x.id === p);
                          const label = pMeta ? pMeta.label : p;
                          return `
                            <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container text-slate-600 dark:text-slate-300 truncate max-w-[170px]" title="${p}: ${label}">${label}</span>
                          `;
                        }).join('')}
                        ${!perms.includes('*') && perms.length > 5 ? `
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-slate-400">+${perms.length - 5} lainnya</span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs gap-2">
                    <span class="text-slate-400 font-medium text-[11px]">${userCount} Pengguna Aktif</span>
                    <div class="flex items-center gap-1.5">
                      ${r.hasOverride ? `
                        <button onclick="KasRT.Pages.UsersRoles.handleResetRoleOverride('${r.id}')" title="Kembalikan ke default bawaan sistem" class="p-1.5 rounded-xl border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer text-xs">
                          <span class="material-symbols-outlined text-sm">restart_alt</span>
                        </button>
                      ` : ''}
                      ${!r.isSystem ? `
                        <button onclick="KasRT.Pages.UsersRoles.handleDeleteRole('${r.id}')" title="Hapus role kustom" class="p-1.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer text-xs">
                          <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                      ` : ''}
                      <button onclick="KasRT.Pages.UsersRoles.openEditRoleModal('${r.id}')" class="px-3 py-1.5 rounded-xl cursor-pointer bg-primary text-white font-bold hover:opacity-95 text-xs flex items-center gap-1 shadow-2xs">
                        <span class="material-symbols-outlined text-sm">edit</span>
                        <span>Ubah Role & Izin</span>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    openAddUserModal() {
      const db = window.KasRT.DB;
      const roles = window.KasRT.Auth.Permissions.roles();
      const residents = db.list('residents').filter(r => r.status === 'Aktif');

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Tambah Pengguna Baru</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.UsersRoles.handleSubmitAddUser(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Nama Lengkap</label>
              <input type="text" id="usr-nama" required placeholder="Bambang Sutrisno" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Email</label>
                <input type="email" id="usr-email" required placeholder="nama@kasrt.id" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
              </div>
              <div>
                <label class="block font-bold mb-1">Username</label>
                <input type="text" id="usr-uname" required placeholder="bambang" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">Nomor WhatsApp</label>
              <input type="tel" id="usr-phone" placeholder="08123456789" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-bold mb-1.5">Pilih Peran (Multi-Role)</label>
              <div class="grid grid-cols-2 gap-2">
                ${roles.map(r => `
                  <label class="flex items-center gap-2.5 p-2 rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container transition-colors">
                    <input type="checkbox" name="usr-roles" value="${r.id}" ${r.id === 'Warga' ? 'checked' : ''} class="rounded text-primary shrink-0" />
                    <div class="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] shrink-0" style="background-color: ${r.color || '#6366f1'}">
                      <span class="material-symbols-outlined text-xs">${r.icon || 'badge'}</span>
                    </div>
                    <div class="min-w-0 flex-1 truncate">
                      <span class="font-bold text-xs truncate block text-on-surface">${r.name}</span>
                      <span class="text-[9px] text-slate-400 font-mono">${r.isSystem ? 'Sistem' : 'Kustom'}</span>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">Hubungkan ke Data Warga (Opsional)</label>
              ${window.KasRT.UI.ResidentPicker.render({
                id: 'usr-resident',
                placeholder: 'Ketik nama warga untuk menghubungkan...',
                allowEmpty: true,
                emptyLabel: '-- Tanpa Relasi Warga --',
                residents
              })}
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan Pengguna</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitAddUser(e) {
      e.preventDefault();
      try {
        const nama = document.getElementById('usr-nama')?.value;
        const email = document.getElementById('usr-email')?.value;
        const username = document.getElementById('usr-uname')?.value;
        const noHp = document.getElementById('usr-phone')?.value;
        const residentId = document.getElementById('usr-resident')?.value || null;
        const roleChecks = document.querySelectorAll('input[name="usr-roles"]:checked');
        const roles = Array.from(roleChecks).map(c => c.value);

        await window.KasRT.UserStore.create({
          nama,
          email,
          username,
          noHp,
          roles,
          residentId
        });

        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Pengguna ${nama} berhasil didaftarkan!`, 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    openEditUserModal(id) {
      const db = window.KasRT.DB;
      const u = db.get('users', id);
      if (!u) return;
      const roles = window.KasRT.Auth.Permissions.roles();

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Ubah Pengguna (${u.nama})</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.UsersRoles.handleSubmitEditUser(event, '${u.id}')" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Nama Lengkap</label>
              <input type="text" id="edit-usr-nama" value="${u.nama}" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-bold mb-1">Nomor WhatsApp</label>
              <input type="tel" id="edit-usr-phone" value="${u.noHp || ''}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-bold mb-1.5">Peran Sistem (Roles)</label>
              <div class="grid grid-cols-2 gap-2">
                ${roles.map(r => `
                  <label class="flex items-center gap-2.5 p-2 rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container transition-colors">
                    <input type="checkbox" name="edit-usr-roles" value="${r.id}" ${(u.roles || []).includes(r.id) ? 'checked' : ''} class="rounded text-primary shrink-0" />
                    <div class="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] shrink-0" style="background-color: ${r.color || '#6366f1'}">
                      <span class="material-symbols-outlined text-xs">${r.icon || 'badge'}</span>
                    </div>
                    <div class="min-w-0 flex-1 truncate">
                      <span class="font-bold text-xs truncate block text-on-surface">${r.name}</span>
                      <span class="text-[9px] text-slate-400 font-mono">${r.isSystem ? 'Sistem' : 'Kustom'}</span>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitEditUser(e, id) {
      e.preventDefault();
      try {
        const nama = document.getElementById('edit-usr-nama')?.value;
        const noHp = document.getElementById('edit-usr-phone')?.value;
        const roleChecks = document.querySelectorAll('input[name="edit-usr-roles"]:checked');
        const roles = Array.from(roleChecks).map(c => c.value);

        await window.KasRT.UserStore.update(id, { nama, noHp, roles });
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Data pengguna berhasil diperbarui!', 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    async toggleStatus(id) {
      try {
        await window.KasRT.UserStore.toggleStatus(id);
        if (window.KasRT.UI) window.KasRT.UI.showToast('Status pengguna diubah!', 'info');
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    async handleDeleteUser(id) {
      const confirm = await window.KasRT.UI.confirmModal({
        title: 'Hapus Pengguna',
        message: 'Apakah Anda yakin ingin menghapus akun pengguna ini dari sistem?',
        danger: true
      });
      if (confirm) {
        try {
          await window.KasRT.UserStore.remove(id);
          if (window.KasRT.UI) window.KasRT.UI.showToast('Pengguna dihapus.', 'info');
          window.KasRT.Events.handleRouting();
        } catch (err) {
          if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
        }
      }
    },

    setRoleFilter(filter) {
      activeRoleFilter = filter;
      window.KasRT.Events.handleRouting();
    },

    handleRoleSearch: Utils.debounce((val) => {
      activeRoleSearch = val;
      window.KasRT.Events.handleRouting();
    }, 150),

    selectRoleIcon(iconName, prefix = 'role-edit') {
      const input = document.getElementById(`${prefix}-icon`);
      if (input) input.value = iconName;
      const preview = document.getElementById(`${prefix}-preview-icon`);
      if (preview) preview.textContent = iconName;
      document.querySelectorAll(`.${prefix}-icon-btn`).forEach(btn => {
        if (btn.getAttribute('data-icon') === iconName) {
          btn.classList.add('ring-2', 'ring-primary', 'bg-primary/10', 'text-primary', 'font-bold');
        } else {
          btn.classList.remove('ring-2', 'ring-primary', 'bg-primary/10', 'text-primary', 'font-bold');
        }
      });
    },

    selectRoleColor(colorHex, prefix = 'role-edit') {
      const input = document.getElementById(`${prefix}-color`);
      if (input) input.value = colorHex;
      const picker = document.getElementById(`${prefix}-color-picker`);
      if (picker) picker.value = colorHex;
      const previewBox = document.getElementById(`${prefix}-preview-box`);
      if (previewBox) previewBox.style.backgroundColor = colorHex;
      document.querySelectorAll(`.${prefix}-color-btn`).forEach(btn => {
        if (btn.getAttribute('data-color') === colorHex) {
          btn.classList.add('ring-2', 'ring-offset-2', 'ring-slate-800', 'dark:ring-white', 'scale-110');
        } else {
          btn.classList.remove('ring-2', 'ring-offset-2', 'ring-slate-800', 'dark:ring-white', 'scale-110');
        }
      });
    },

    toggleAllPermissions(checked, prefix = 'role-edit') {
      document.querySelectorAll(`input[name="${prefix}-perm"]`).forEach(chk => {
        chk.checked = checked;
      });
      this.updatePermCounters(prefix);
    },

    toggleGroupPermissions(groupName, checked, prefix = 'role-edit') {
      document.querySelectorAll(`input[name="${prefix}-perm"][data-group="${groupName}"]`).forEach(chk => {
        chk.checked = checked;
      });
      this.updatePermCounters(prefix);
    },

    updatePermCounters(prefix = 'role-edit') {
      const groups = ['Administrasi', 'Keuangan', 'Iuran & Cicilan', 'Data Warga', 'Inventaris RT', 'Portal Warga'];
      groups.forEach(grp => {
        const total = document.querySelectorAll(`input[name="${prefix}-perm"][data-group="${grp}"]`).length;
        const checked = document.querySelectorAll(`input[name="${prefix}-perm"][data-group="${grp}"]:checked`).length;
        const grpId = grp.replace(/[^a-zA-Z]/g, '');
        const counterEl = document.getElementById(`${prefix}-counter-${grpId}`);
        if (counterEl) {
          counterEl.textContent = `(${checked}/${total})`;
        }
      });
      const totalAll = document.querySelectorAll(`input[name="${prefix}-perm"]`).length;
      const checkedAll = document.querySelectorAll(`input[name="${prefix}-perm"]:checked`).length;
      const totalCounterEl = document.getElementById(`${prefix}-total-counter`);
      if (totalCounterEl) {
        totalCounterEl.textContent = `${checkedAll} dari ${totalAll} izin fitur aktif`;
      }
    },

    filterPermissions(query, prefix = 'role-edit') {
      const q = String(query || '').toLowerCase().trim();
      document.querySelectorAll(`.${prefix}-perm-item`).forEach(item => {
        const text = (item.textContent || '').toLowerCase();
        if (!q || text.includes(q)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    },

    openAddRoleModal() {
      const allPerms = window.KasRT.Constants.ALL_PERMISSIONS || [];
      const groups = ['Administrasi', 'Keuangan', 'Iuran & Cicilan', 'Data Warga', 'Inventaris RT', 'Portal Warga'];
      const defaultIcon = 'shield_person';
      const defaultColor = '#4f46e5';

      const popularIcons = [
        'shield_person', 'security', 'local_police', 'military_tech', 'account_balance_wallet',
        'badge', 'history_edu', 'inventory_2', 'person', 'support_agent',
        'groups', 'handshake', 'assignment', 'engineering', 'supervised_user_circle',
        'verified_user', 'campaign', 'health_and_safety', 'receipt_long', 'construction'
      ];

      const presetColors = [
        '#4f46e5', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4',
        '#64748b', '#ec4899', '#ef4444', '#14b8a6', '#d97706', '#3b82f6'
      ];

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div>
              <h3 class="text-base font-bold font-display text-on-surface">Tambah Role Kustom Baru</h3>
              <p class="text-xs text-slate-500">Buat peran jabatan baru dengan wewenang khusus sesuai kebutuhan RT</p>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>

          <form onsubmit="KasRT.Pages.UsersRoles.handleSubmitAddRole(event)" class="space-y-4 text-xs">
            <!-- Preview Box -->
            <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-container/30 border border-outline-variant">
              <div id="role-add-preview-box" class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-all shrink-0" style="background-color: ${defaultColor}">
                <span id="role-add-preview-icon" class="material-symbols-outlined text-2xl">${defaultIcon}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span id="role-add-preview-name" class="font-black text-sm text-on-surface truncate">Nama Role Kustom</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">Kustom Baru</span>
                </div>
                <span class="text-[11px] text-slate-400">Pratinjau tampilan badge & ikon di sistem</span>
              </div>
            </div>

            <!-- Form Identitas Role -->
            <div class="space-y-3">
              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-200">Nama Role / Sebutan Jabatan <span class="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  id="role-add-name" 
                  required 
                  placeholder="Contoh: Seksi Keamanan & Ronda, Koordinator Blok, Humas RT" 
                  oninput="const p = document.getElementById('role-add-preview-name'); if (p) p.textContent = this.value || 'Nama Role Kustom';" 
                  class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                />
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-200">Deskripsi Tugas & Wewenang</label>
                <textarea 
                  id="role-add-desc" 
                  rows="2" 
                  placeholder="Contoh: Mengkoordinasikan jadwal pos ronda malam warga, menjaga sarana keamanan, dan pelaporan darurat..." 
                  class="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs leading-relaxed"
                ></textarea>
              </div>

              <!-- Pemilihan Ikon -->
              <div>
                <label class="block font-bold mb-1.5 text-slate-700 dark:text-slate-200">Pilih Ikon Role</label>
                <input type="hidden" id="role-add-icon" value="${defaultIcon}" />
                <div class="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-32 overflow-y-auto p-2 rounded-2xl bg-surface-container/20 border border-outline-variant">
                  ${popularIcons.map(ic => `
                    <button 
                      type="button" 
                      data-icon="${ic}" 
                      onclick="KasRT.Pages.UsersRoles.selectRoleIcon('${ic}', 'role-add')" 
                      class="role-add-icon-btn p-2 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-surface-lowest transition-all cursor-pointer ${ic === defaultIcon ? 'ring-2 ring-primary bg-primary/10 text-primary font-bold' : ''}" 
                      title="${ic}"
                    >
                      <span class="material-symbols-outlined text-xl">${ic}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Pemilihan Warna -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block font-bold text-slate-700 dark:text-slate-200">Warna Aksen Badge</label>
                  <label class="text-[11px] font-bold text-primary flex items-center gap-1 cursor-pointer">
                    <span>Pilih Custom Hex:</span>
                    <input type="color" id="role-add-color-picker" value="${defaultColor}" oninput="KasRT.Pages.UsersRoles.selectRoleColor(this.value, 'role-add')" class="w-6 h-6 rounded-md border-0 cursor-pointer p-0 bg-transparent" />
                  </label>
                </div>
                <input type="hidden" id="role-add-color" value="${defaultColor}" />
                <div class="flex flex-wrap gap-2 p-2 rounded-2xl bg-surface-container/20 border border-outline-variant">
                  ${presetColors.map(c => `
                    <button 
                      type="button" 
                      data-color="${c}" 
                      onclick="KasRT.Pages.UsersRoles.selectRoleColor('${c}', 'role-add')" 
                      class="role-add-color-btn w-6 h-6 rounded-full transition-all cursor-pointer shadow-2xs ${c === defaultColor ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-110' : 'hover:scale-105'}" 
                      style="background-color: ${c}"
                    ></button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Matriks Izin Akses RBAC -->
            <div class="pt-4 border-t border-outline-variant space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span class="font-extrabold text-xs text-on-surface block">Centang Hak Akses & Izin Fitur (RBAC)</span>
                  <span id="role-add-total-counter" class="text-[11px] text-primary font-bold">0 dari ${allPerms.length} izin fitur aktif</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <button type="button" onclick="KasRT.Pages.UsersRoles.toggleAllPermissions(true, 'role-add')" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary/10 text-primary font-bold text-[11px] cursor-pointer">Pilih Semua</button>
                  <button type="button" onclick="KasRT.Pages.UsersRoles.toggleAllPermissions(false, 'role-add')" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-slate-200 text-slate-500 font-bold text-[11px] cursor-pointer">Batal Semua</button>
                </div>
              </div>

              <div class="relative">
                <input 
                  type="text" 
                  placeholder="Filter izin fitur (misal: transaksi, warga, inventaris)..." 
                  oninput="KasRT.Pages.UsersRoles.filterPermissions(this.value, 'role-add')" 
                  class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs focus:ring-1 focus:ring-primary" 
                />
                <span class="material-symbols-outlined text-slate-400 text-xs absolute left-2.5 top-2">search</span>
              </div>

              <div class="space-y-3">
                ${groups.map(grp => {
                  const grpPerms = allPerms.filter(p => p.group === grp);
                  if (grpPerms.length === 0) return '';
                  const grpId = grp.replace(/[^a-zA-Z]/g, '');
                  return `
                    <div class="p-3.5 rounded-2xl bg-surface-container/20 border border-outline-variant space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>${grp}</span>
                          <span id="role-add-counter-${grpId}" class="text-primary font-mono font-bold text-[10px]">(0/${grpPerms.length})</span>
                        </span>
                        <div class="flex items-center gap-1">
                          <button type="button" onclick="KasRT.Pages.UsersRoles.toggleGroupPermissions('${grp}', true, 'role-add')" class="text-[10px] text-primary hover:underline font-bold px-1.5 py-0.5 cursor-pointer">Pilih Grup</button>
                          <span class="text-slate-300 text-[10px]">|</span>
                          <button type="button" onclick="KasRT.Pages.UsersRoles.toggleGroupPermissions('${grp}', false, 'role-add')" class="text-[10px] text-slate-400 hover:underline px-1.5 py-0.5 cursor-pointer">Batal</button>
                        </div>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        ${grpPerms.map(p => `
                          <label class="role-add-perm-item flex items-start gap-2 p-2 rounded-xl border border-outline-variant/70 hover:bg-surface-lowest cursor-pointer transition-colors">
                            <input 
                              type="checkbox" 
                              name="role-add-perm" 
                              data-group="${grp}" 
                              value="${p.id}" 
                              onchange="KasRT.Pages.UsersRoles.updatePermCounters('role-add')" 
                              class="mt-0.5 rounded text-primary" 
                            />
                            <div class="min-w-0 flex-1">
                              <span class="font-bold text-xs text-on-surface block leading-tight">${p.label}</span>
                              <span class="text-[10px] text-slate-400 font-mono block">${p.id}</span>
                            </div>
                          </label>
                        `).join('')}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="pt-4 border-t border-outline-variant flex items-center justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer shadow-md hover:opacity-95">Simpan Role Kustom</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'lg' });
      this.updatePermCounters('role-add');
    },

    async handleSubmitAddRole(e) {
      e.preventDefault();
      try {
        const name = document.getElementById('role-add-name')?.value;
        const description = document.getElementById('role-add-desc')?.value;
        const icon = document.getElementById('role-add-icon')?.value;
        const color = document.getElementById('role-add-color')?.value;
        const perms = Array.from(document.querySelectorAll('input[name="role-add-perm"]:checked')).map(c => c.value);

        const newRole = await window.KasRT.RoleStore.create({
          name,
          description,
          icon,
          color,
          permissions: perms
        });

        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Role kustom "${newRole.name}" berhasil dibuat!`, 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    openEditRoleModal(roleId) {
      const role = window.KasRT.Auth.Permissions.roleById(roleId);
      if (!role) return;
      const allPerms = window.KasRT.Constants.ALL_PERMISSIONS || [];
      const groups = ['Administrasi', 'Keuangan', 'Iuran & Cicilan', 'Data Warga', 'Inventaris RT', 'Portal Warga'];
      const currentPerms = role.permissions || [];

      const popularIcons = [
        'account_balance_wallet', 'military_tech', 'badge', 'history_edu', 'inventory_2',
        'person', 'shield_person', 'security', 'local_police', 'payments',
        'support_agent', 'groups', 'handshake', 'assignment', 'engineering',
        'supervised_user_circle', 'verified_user', 'campaign', 'health_and_safety', 'receipt_long'
      ];

      const presetColors = [
        '#4f46e5', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4',
        '#64748b', '#ec4899', '#ef4444', '#14b8a6', '#d97706', '#3b82f6'
      ];

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div>
              <h3 class="text-base font-bold font-display text-on-surface">Kustomisasi Role: ${role.name}</h3>
              <p class="text-xs text-slate-500">${role.isSystem ? 'Role Bawaan Sistem (Dapat disesuaikan nama, tugas, ikon & wewenangnya)' : 'Role Kustom Administrator'}</p>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>

          <form onsubmit="KasRT.Pages.UsersRoles.handleSubmitRole(event, '${role.id}')" class="space-y-4 text-xs">
            <!-- Header Card Preview -->
            <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-container/30 border border-outline-variant">
              <div id="role-edit-preview-box" class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-all shrink-0" style="background-color: ${role.color}">
                <span id="role-edit-preview-icon" class="material-symbols-outlined text-2xl">${role.icon}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span id="role-edit-preview-name" class="font-black text-sm text-on-surface truncate">${role.name}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${role.isSystem ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-primary/10 text-primary'}">${role.isSystem ? 'Sistem' : 'Kustom'}</span>
                  ${role.hasOverride ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Disesuaikan</span>` : ''}
                </div>
                <span class="text-[11px] text-slate-400 font-mono">Kode ID: ${role.id}</span>
              </div>
            </div>

            <!-- Form Data Identitas Role -->
            <div class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold mb-1 text-slate-700 dark:text-slate-200">Nama Role / Sebutan Jabatan <span class="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      id="role-edit-name" 
                      value="${role.name}" 
                      required 
                      oninput="const p = document.getElementById('role-edit-preview-name'); if (p) p.textContent = this.value || 'Nama Role';" 
                      class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                    />
                    <span class="text-[10px] text-slate-400">Nama yang tampil pada akun pengguna & dokumen</span>
                  </div>
                  <div>
                    <label class="block font-bold mb-1 text-slate-700 dark:text-slate-200">ID Sistem (Terkunci)</label>
                    <input 
                      type="text" 
                      value="${role.id}" 
                      disabled 
                      class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container/50 font-mono text-slate-400 text-xs" 
                    />
                    <span class="text-[10px] text-slate-400">Pengenal unik basis data internal</span>
                  </div>
                </div>

                <div>
                  <label class="block font-bold mb-1 text-slate-700 dark:text-slate-200">Deskripsi Tugas & Wewenang</label>
                  <textarea 
                    id="role-edit-desc" 
                    rows="2" 
                    class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs leading-relaxed"
                  >${role.description || ''}</textarea>
                </div>

                <!-- Pemilihan Ikon -->
                <div>
                  <label class="block font-bold mb-1.5 text-slate-700 dark:text-slate-200">Pilih Ikon Role</label>
                  <input type="hidden" id="role-edit-icon" value="${role.icon || 'badge'}" />
                  <div class="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-32 overflow-y-auto p-2 rounded-2xl bg-surface-container/20 border border-outline-variant">
                    ${popularIcons.map(ic => `
                      <button 
                        type="button" 
                        data-icon="${ic}" 
                        onclick="KasRT.Pages.UsersRoles.selectRoleIcon('${ic}', 'role-edit')" 
                        class="role-edit-icon-btn p-2 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-surface-lowest transition-all cursor-pointer ${ic === role.icon ? 'ring-2 ring-primary bg-primary/10 text-primary font-bold' : ''}" 
                        title="${ic}"
                      >
                        <span class="material-symbols-outlined text-xl">${ic}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Pemilihan Warna -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="block font-bold text-slate-700 dark:text-slate-200">Warna Aksen Badge</label>
                    <label class="text-[11px] font-bold text-primary flex items-center gap-1 cursor-pointer">
                      <span>Pilih Custom Hex:</span>
                      <input type="color" id="role-edit-color-picker" value="${role.color || '#4f46e5'}" oninput="KasRT.Pages.UsersRoles.selectRoleColor(this.value, 'role-edit')" class="w-6 h-6 rounded-md border-0 cursor-pointer p-0 bg-transparent" />
                    </label>
                  </div>
                  <input type="hidden" id="role-edit-color" value="${role.color || '#4f46e5'}" />
                  <div class="flex flex-wrap gap-2 p-2 rounded-2xl bg-surface-container/20 border border-outline-variant">
                    ${presetColors.map(c => `
                      <button 
                        type="button" 
                        data-color="${c}" 
                        onclick="KasRT.Pages.UsersRoles.selectRoleColor('${c}', 'role-edit')" 
                        class="role-edit-color-btn w-6 h-6 rounded-full transition-all cursor-pointer shadow-2xs ${c === role.color ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-110' : 'hover:scale-105'}" 
                        style="background-color: ${c}"
                      ></button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Matriks Izin Akses RBAC -->
              <div class="pt-4 border-t border-outline-variant space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span class="font-extrabold text-xs text-on-surface block">Centang Hak Akses & Izin Fitur (RBAC)</span>
                    <span id="role-edit-total-counter" class="text-[11px] text-primary font-bold">...</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button type="button" onclick="KasRT.Pages.UsersRoles.toggleAllPermissions(true, 'role-edit')" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary/10 text-primary font-bold text-[11px] cursor-pointer">Pilih Semua</button>
                    <button type="button" onclick="KasRT.Pages.UsersRoles.toggleAllPermissions(false, 'role-edit')" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-slate-200 text-slate-500 font-bold text-[11px] cursor-pointer">Batal Semua</button>
                  </div>
                </div>

                <div class="relative">
                  <input 
                    type="text" 
                    placeholder="Filter izin fitur (misal: transaksi, iuran, inventaris)..." 
                    oninput="KasRT.Pages.UsersRoles.filterPermissions(this.value, 'role-edit')" 
                    class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs focus:ring-1 focus:ring-primary" 
                  />
                  <span class="material-symbols-outlined text-slate-400 text-xs absolute left-2.5 top-2">search</span>
                </div>

                <div class="space-y-3">
                  ${groups.map(grp => {
                    const grpPerms = allPerms.filter(p => p.group === grp);
                    if (grpPerms.length === 0) return '';
                    const grpId = grp.replace(/[^a-zA-Z]/g, '');
                    return `
                      <div class="p-3.5 rounded-2xl bg-surface-container/20 border border-outline-variant space-y-2">
                        <div class="flex items-center justify-between">
                          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <span>${grp}</span>
                            <span id="role-edit-counter-${grpId}" class="text-primary font-mono font-bold text-[10px]">(0/${grpPerms.length})</span>
                          </span>
                          <div class="flex items-center gap-1">
                            <button type="button" onclick="KasRT.Pages.UsersRoles.toggleGroupPermissions('${grp}', true, 'role-edit')" class="text-[10px] text-primary hover:underline font-bold px-1.5 py-0.5 cursor-pointer">Pilih Grup</button>
                            <span class="text-slate-300 text-[10px]">|</span>
                            <button type="button" onclick="KasRT.Pages.UsersRoles.toggleGroupPermissions('${grp}', false, 'role-edit')" class="text-[10px] text-slate-400 hover:underline px-1.5 py-0.5 cursor-pointer">Batal</button>
                          </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          ${grpPerms.map(p => `
                            <label class="role-edit-perm-item flex items-start gap-2 p-2 rounded-xl border border-outline-variant/70 hover:bg-surface-lowest cursor-pointer transition-colors ${currentPerms.includes(p.id) ? 'bg-primary/5 border-primary/20' : ''}">
                              <input 
                                type="checkbox" 
                                name="role-edit-perm" 
                                data-group="${grp}" 
                                value="${p.id}" 
                                ${currentPerms.includes(p.id) ? 'checked' : ''} 
                                onchange="KasRT.Pages.UsersRoles.updatePermCounters('role-edit')" 
                                class="mt-0.5 rounded text-primary" 
                              />
                              <div class="min-w-0 flex-1">
                                <span class="font-bold text-xs text-on-surface block leading-tight">${p.label}</span>
                                <span class="text-[10px] text-slate-400 font-mono block">${p.id}</span>
                              </div>
                            </label>
                          `).join('')}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

            <!-- Footer Actions -->
            <div class="pt-4 border-t border-outline-variant flex items-center justify-between">
              <div>
                ${role.hasOverride ? `
                  <button type="button" onclick="KasRT.Pages.UsersRoles.handleResetRoleOverride('${role.id}')" class="px-3.5 py-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-300 cursor-pointer">
                    <span class="material-symbols-outlined text-sm">restart_alt</span>
                    <span>Reset ke Default Sistem</span>
                  </button>
                ` : (!role.isSystem ? `
                  <button type="button" onclick="KasRT.Pages.UsersRoles.handleDeleteRole('${role.id}')" class="px-3.5 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 border border-rose-300 cursor-pointer">
                    <span class="material-symbols-outlined text-sm">delete</span>
                    <span>Hapus Role Kustom</span>
                  </button>
                ` : '<div></div>')}
              </div>
              <div class="flex items-center gap-3">
                <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Tutup</button>
                <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer shadow-md hover:opacity-95">Simpan Pengaturan Role</button>
              </div>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'lg' });
      this.updatePermCounters('role-edit');
    },

    async handleSubmitRole(e, roleId) {
      e.preventDefault();
      try {
        const name = document.getElementById('role-edit-name')?.value;
        const description = document.getElementById('role-edit-desc')?.value;
        const icon = document.getElementById('role-edit-icon')?.value;
        const color = document.getElementById('role-edit-color')?.value;
        const perms = Array.from(document.querySelectorAll('input[name="role-edit-perm"]:checked')).map(c => c.value);

        await window.KasRT.RoleStore.update(roleId, {
          name,
          description,
          icon,
          color,
          permissions: perms
        });

        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Pengaturan role "${name || roleId}" berhasil disimpan!`, 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    async handleResetRoleOverride(roleId) {
      const role = window.KasRT.RoleStore.get(roleId);
      const confirm = await window.KasRT.UI.confirmModal({
        title: 'Reset Role ke Default',
        message: `Kembalikan pengaturan role "${role?.name || roleId}" ke konfigurasi bawaan sistem? Perubahan nama, ikon, dan izin khusus akan direset.`,
        danger: false
      });
      if (confirm) {
        try {
          await window.KasRT.RoleStore.resetOverride(roleId);
          if (window.KasRT.UI) window.KasRT.UI.closeModal();
          window.KasRT.Events.handleRouting();
        } catch (err) {
          if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
        }
      }
    },

    async handleDeleteRole(roleId) {
      const role = window.KasRT.RoleStore.get(roleId);
      if (!role) return;
      const usersWithRole = window.KasRT.DB.list('users').filter(u => u.roles && u.roles.includes(roleId));
      if (usersWithRole.length > 0) {
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Gagal menghapus: Role ini masih digunakan oleh ${usersWithRole.length} pengguna aktif. Ubah role pengguna terkait terlebih dahulu.`, 'error');
        }
        return;
      }
      const confirm = await window.KasRT.UI.confirmModal({
        title: 'Hapus Role Kustom',
        message: `Hapus role "${role.name}" secara permanen dari sistem?`,
        danger: true
      });
      if (confirm) {
        try {
          await window.KasRT.RoleStore.remove(roleId);
          if (window.KasRT.UI) {
            window.KasRT.UI.showToast(`Role "${role.name}" berhasil dihapus.`, 'info');
            window.KasRT.UI.closeModal();
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
  window.KasRT.Pages.UsersRoles = UsersRolesPage;
  window.KasRT_Pages_UsersRoles_Loaded = true;
})();
