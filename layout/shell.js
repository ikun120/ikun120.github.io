/**
 * KasRT - App Shell & Responsive Multi-Tier Navigation System
 */
(function() {
  'use strict';
  if (window.KasRT_Shell_Loaded) return;

  const LS_SIDEBAR = 'kasrt_sidebar_collapsed';
  let isCollapsed = localStorage.getItem(LS_SIDEBAR) === 'true';
  let isMobileDrawerOpen = false;

  const Shell = {
    get isCollapsed() { return isCollapsed; },

    toggleSidebar() {
      isCollapsed = !isCollapsed;
      localStorage.setItem(LS_SIDEBAR, String(isCollapsed));
      const sidebarEl = document.getElementById('kasrt-sidebar');
      const mainContent = document.getElementById('kasrt-main-content');
      if (sidebarEl) {
        if (isCollapsed) {
          sidebarEl.classList.remove('w-64');
          sidebarEl.classList.add('w-20', 'sidebar-collapsed');
        } else {
          sidebarEl.classList.remove('w-20', 'sidebar-collapsed');
          sidebarEl.classList.add('w-64');
        }
      }
      if (mainContent) {
        if (isCollapsed) {
          mainContent.classList.remove('md:pl-64');
          mainContent.classList.add('md:pl-20');
        } else {
          mainContent.classList.remove('md:pl-20');
          mainContent.classList.add('md:pl-64');
        }
      }
      const collapseIcon = document.getElementById('sidebar-collapse-icon');
      if (collapseIcon) {
        collapseIcon.textContent = isCollapsed ? 'menu_open' : 'menu';
      }
      const toggleBtn = document.getElementById('btn-toggle-sidebar');
      if (toggleBtn) {
        toggleBtn.setAttribute('title', isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar');
      }
    },

    toggleMobileDrawer() {
      isMobileDrawerOpen = !isMobileDrawerOpen;
      const drawer = document.getElementById('kasrt-mobile-sidebar-drawer');
      if (drawer) {
        if (isMobileDrawerOpen) {
          drawer.classList.remove('hidden');
          requestAnimationFrame(() => {
            drawer.querySelector('.drawer-backdrop')?.classList.remove('opacity-0');
            drawer.querySelector('.drawer-panel')?.classList.remove('-translate-x-full');
          });
        } else {
          drawer.querySelector('.drawer-backdrop')?.classList.add('opacity-0');
          drawer.querySelector('.drawer-panel')?.classList.add('-translate-x-full');
          setTimeout(() => drawer.classList.add('hidden'), 200);
        }
      }
    },

    showMegaMenu() {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? auth.user : null;
      const sections = (window.KasRT && window.KasRT.MenuRegistry) ? window.KasRT.MenuRegistry.get(user) : [];
      const colorMap = {
        indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
        rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
      };
      const iconBgMap = {
        indigo: 'bg-indigo-600 text-white',
        emerald: 'bg-emerald-600 text-white',
        sky: 'bg-sky-600 text-white',
        amber: 'bg-amber-600 text-white',
        violet: 'bg-violet-600 text-white',
        rose: 'bg-rose-600 text-white'
      };
      const isWarga = (auth && auth.Permissions) ? auth.Permissions.isWarga(user) : false;

      const html = `
        <div class="p-6 max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-6">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-theme-gradient text-white flex items-center justify-center font-black text-xl shadow-md">
                <span class="material-symbols-outlined text-2xl">grid_view</span>
              </div>
              <div>
                <h3 class="font-extrabold text-lg text-on-surface font-display">${isWarga ? 'Menu & Portal Warga KasRT' : 'Semua Menu & Navigasi KasRT'}</h3>
                <p class="text-xs text-slate-500">${isWarga ? 'Akses fitur portal tagihan pribadi, bukti iuran, dan inventaris publik' : 'Pilih modul atau fitur sistem untuk navigasi langsung'}</p>
              </div>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${sections.map(sec => {
              const themeClass = colorMap[sec.color] || colorMap.indigo;
              const iconClass = iconBgMap[sec.color] || iconBgMap.indigo;
              return `
                <div class="p-5 rounded-3xl border ${themeClass} flex flex-col shadow-sm">
                  <div class="flex items-center gap-2.5 mb-4 pb-2 border-b border-current/15 font-display">
                    <span class="w-7 h-7 rounded-lg ${iconClass} flex items-center justify-center text-xs">
                      <span class="material-symbols-outlined text-sm">${sec.icon || 'folder'}</span>
                    </span>
                    <h4 class="font-extrabold text-sm uppercase tracking-wider">${sec.section}</h4>
                  </div>
                  <div class="space-y-2 flex-1">
                    ${sec.items.map(item => `
                      <a href="${item.route}" onclick="KasRT.UI.closeModal()" class="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface-lowest/80 transition-all border border-transparent hover:border-outline-variant/60">
                        <div class="w-8 h-8 rounded-xl bg-surface-lowest text-slate-700 dark:text-slate-200 group-hover:bg-primary group-hover:text-white flex items-center justify-center flex-shrink-0 shadow-xs transition-colors">
                          <span class="material-symbols-outlined text-lg">${item.icon}</span>
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="text-xs font-bold text-on-surface group-hover:text-primary transition-colors flex items-center justify-between">
                            <span>${item.label}</span>
                            <span class="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                          </div>
                          <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${item.desc || ''}</p>
                        </div>
                      </a>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="mt-8 pt-4 border-t border-outline-variant flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-500 text-sm">info</span>
              <span>Tekan <kbd class="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[10px] border border-outline-variant">Ctrl+K</kbd> untuk pencarian cepat</span>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="px-5 py-2 rounded-xl bg-surface-container text-on-surface font-bold hover:bg-slate-200 cursor-pointer">Tutup</button>
          </div>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'xl' });
    },

    renderForbidden(requiredPerm = '', path = '') {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? auth.user : null;
      const primaryRole = (user && user.roles && user.roles[0]) || 'Tamu';
      const roleMeta = (auth && auth.Permissions) ? auth.Permissions.roleById(primaryRole) : null;
      const primaryRoleName = roleMeta ? roleMeta.name : primaryRole;
      const isWarga = (auth && auth.Permissions) ? auth.Permissions.isWarga(user) : false;
      const isDemo = (window.KasRT && window.KasRT.LandingMode) ? window.KasRT.LandingMode.isDemo() : true;

      const html = `
        <div class="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center">
          <div class="w-20 h-20 rounded-3xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center mb-6 shadow-xl">
            <span class="material-symbols-outlined text-4xl">lock_person</span>
          </div>
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold mb-3">
            <span class="material-symbols-outlined text-sm">shield</span>
            <span>403 Akses Dibatasi (RBAC Protected)</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black font-display text-on-surface">Hak Akses Tidak Mencukupi</h2>
          
          <p class="text-xs sm:text-sm text-slate-500 max-w-lg mt-2 leading-relaxed">
            Akun Anda saat ini login sebagai role <strong class="text-primary font-bold">${primaryRoleName}</strong> (${primaryRole}), namun halaman <code class="px-1.5 py-0.5 rounded bg-surface-container font-mono text-xs">${path}</code> memerlukan hak akses khusus: <strong class="text-rose-600 font-bold">${requiredPerm}</strong>.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3 mt-8">
            ${isWarga ? `
              <a href="#/app/portal" class="px-6 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs shadow-md hover:opacity-90 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-base">home</span>
                <span>Kembali ke Portal Warga</span>
              </a>
            ` : `
              <a href="#/app/dashboard" class="px-6 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs shadow-md hover:opacity-90 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-base">dashboard</span>
                <span>Kembali ke Dashboard Utama</span>
              </a>
            `}
          </div>
          ${isDemo ? `
            <div class="mt-8 pt-4 border-t border-outline-variant/60 max-w-md w-full">
              <span class="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-2">Uji Coba Cepat Mode Demo: Beralih Role</span>
              <div class="flex flex-wrap items-center justify-center gap-2">
                <button onclick="KasRT.Auth.demoLogin('Admin')" class="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 cursor-pointer">
                  Switch Admin
                </button>
                <button onclick="KasRT.Auth.demoLogin('Bendahara')" class="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 cursor-pointer">
                  Switch Bendahara
                </button>
                <button onclick="KasRT.Auth.demoLogin('Warga')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer">
                  Switch Warga
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      `;
      this.render(html, { title: 'Akses Ditolak (403)' });
    },

    render(contentHtml, { title = 'Dashboard' } = {}) {
      const appEl = document.getElementById('app');
      if (!appEl) return;

      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? auth.user : null;
      const db = window.KasRT && window.KasRT.DB;
      const settings = (db && db.get('settings', 'global')) || {};
      const menuSections = (window.KasRT && window.KasRT.MenuRegistry) ? window.KasRT.MenuRegistry.get(user) : [];
      const currentRoute = (window.KasRT && window.KasRT.Events) ? window.KasRT.Events.getCurrentRoute() : { hash: '#/app/dashboard' };
      const isDemo = (window.KasRT && window.KasRT.LandingMode) ? window.KasRT.LandingMode.isDemo() : true;
      const notifications = (db && db.list('notifications')) || [];
      const unreadNotifCount = notifications.filter(n => !n.dibaca).length;
      const primaryRole = (user && user.roles && user.roles[0]) || 'Admin';
      const allAvailableRoles = (auth && auth.Permissions) ? auth.Permissions.roles() : [];
      const primaryRoleMeta = allAvailableRoles.find(r => r.id === primaryRole) || (auth && auth.Permissions ? auth.Permissions.roleById(primaryRole) : null);
      const primaryRoleName = primaryRoleMeta ? primaryRoleMeta.name : primaryRole;
      const primaryRoleColor = primaryRoleMeta ? (primaryRoleMeta.color || '#4f46e5') : '#4f46e5';
      const primaryRoleIcon = primaryRoleMeta ? (primaryRoleMeta.icon || 'badge') : 'badge';
      const userInitials = (window.KasRT && window.KasRT.Utils) ? window.KasRT.Utils.initials(user?.nama || 'RT') : 'RT';
      const isWarga = (auth && auth.Permissions) ? auth.Permissions.isWarga(user) : false;
      const isAdmin = (auth && auth.Permissions) ? auth.Permissions.isAdmin(user) : false;
      const canViewDbMonitor = isAdmin || (auth && auth.Permissions && auth.Permissions.has('view_db_monitor', user));
      const homeRoute = isWarga ? '#/app/portal' : '#/app/dashboard';
      const dbMonitor = window.KasRT && window.KasRT.DBMonitor;
      const monitorState = dbMonitor ? dbMonitor.getState() : { status: 'ONLINE', latencyMs: 12 };
      const activeCollapsed = isCollapsed;

      const groupThemes = {
        indigo: { cardBg: 'bg-indigo-50/70 dark:bg-indigo-950/40', border: 'border-indigo-200/80 dark:border-indigo-800/60', title: 'text-indigo-900 dark:text-indigo-300', badge: 'bg-indigo-600 text-white', icon: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60', active: 'bg-indigo-600 text-white' },
        emerald: { cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/40', border: 'border-emerald-200/80 dark:border-emerald-800/60', title: 'text-emerald-900 dark:text-emerald-300', badge: 'bg-emerald-600 text-white', icon: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60', active: 'bg-emerald-600 text-white' },
        sky: { cardBg: 'bg-sky-50/70 dark:bg-sky-950/40', border: 'border-sky-200/80 dark:border-sky-800/60', title: 'text-sky-900 dark:text-sky-300', badge: 'bg-sky-600 text-white', icon: 'text-sky-600 dark:text-sky-400', hover: 'hover:bg-sky-100/80 dark:hover:bg-sky-900/60', active: 'bg-sky-600 text-white' },
        amber: { cardBg: 'bg-amber-50/70 dark:bg-amber-950/40', border: 'border-amber-200/80 dark:border-amber-800/60', title: 'text-amber-950 dark:text-amber-300', badge: 'bg-amber-600 text-white', icon: 'text-amber-600 dark:text-amber-400', hover: 'hover:bg-amber-100/80 dark:hover:bg-amber-900/60', active: 'bg-amber-600 text-white' },
        violet: { cardBg: 'bg-violet-50/70 dark:bg-violet-950/40', border: 'border-violet-200/80 dark:border-violet-800/60', title: 'text-violet-900 dark:text-violet-300', badge: 'bg-violet-600 text-white', icon: 'text-violet-600 dark:text-violet-400', hover: 'hover:bg-violet-100/80 dark:hover:bg-violet-900/60', active: 'bg-violet-600 text-white' },
        rose: { cardBg: 'bg-rose-50/70 dark:bg-rose-950/40', border: 'border-rose-200/80 dark:border-rose-800/60', title: 'text-rose-900 dark:text-rose-300', badge: 'bg-rose-600 text-white', icon: 'text-rose-600 dark:text-rose-400', hover: 'hover:bg-rose-100/80 dark:hover:bg-rose-900/60', active: 'bg-rose-600 text-white' }
      };

      appEl.innerHTML = `
        <div class="min-h-screen bg-surface text-on-surface flex flex-col font-sans transition-colors duration-200">
          <!-- 1. MOBILE BACKDROP DRAWER -->
          <div id="kasrt-mobile-sidebar-drawer" class="hidden fixed inset-0 z-50 md:hidden">
            <div class="drawer-backdrop fixed inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 transition-opacity duration-200" onclick="KasRT.Shell.toggleMobileDrawer()"></div>
            <div class="drawer-panel fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-surface-lowest shadow-2xl border-r border-outline-variant flex flex-col -translate-x-full transition-transform duration-200 overflow-y-auto kasrt-sidebar-scroll">
              <div class="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container/30">
                <div class="flex items-center gap-3">
                  ${(window.KasRT && window.KasRT.UI && window.KasRT.UI.renderBrandLogo)
                    ? window.KasRT.UI.renderBrandLogo({ size: 40 })
                    : `
                      <div class="w-10 h-10 rounded-2xl bg-theme-gradient text-white flex items-center justify-center font-black font-display text-lg shadow-md">R</div>
                      <div>
                        <h2 class="font-extrabold text-base leading-tight text-on-surface font-display">Rukun</h2>
                        <p class="text-xs text-slate-500 font-medium truncate max-w-[150px]">${settings.namaOrganisasi || 'RT 01 / RW 01'}</p>
                      </div>
                    `}
                </div>
                <button class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-surface-container cursor-pointer" onclick="KasRT.Shell.toggleMobileDrawer()">
                  <span class="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
              
              <div class="flex-1 p-3 space-y-3">
                ${menuSections.map(sec => {
                  const t = groupThemes[sec.color] || groupThemes.indigo;
                  return `
                    <div class="sidebar-group-card rounded-2xl border ${t.cardBg} ${t.border} p-2 shadow-2xs">
                      <div class="px-2 py-1 mb-1 text-xs font-black uppercase tracking-wider ${t.title} flex items-center justify-between">
                        <div class="flex items-center gap-1.5 min-w-0">
                          <span class="w-5 h-5 rounded-md ${t.badge} flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                            <span class="material-symbols-outlined text-sm">${sec.icon || 'folder'}</span>
                          </span>
                          <span class="truncate">${sec.section}</span>
                        </div>
                        <span class="text-xs font-mono px-2 py-0.5 rounded-md bg-surface-lowest/70 text-slate-500 font-bold">${sec.items.length}</span>
                      </div>
                      <div class="space-y-1">
                        ${sec.items.map(item => {
                          let isActive = false;
                          if (item.route.includes('?')) {
                            isActive = currentRoute.hash === item.route;
                          } else {
                            isActive = (currentRoute.hash === item.route || currentRoute.path === item.route.replace('#', '')) && !currentRoute.hash.includes('?');
                          }
                          return `
                            <a href="${item.route}" onclick="KasRT.Shell.toggleMobileDrawer()" class="sidebar-link ${isActive ? 'is-active text-white ' + t.active : `text-slate-700 dark:text-slate-200 ${t.hover}`} flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all">
                              <span class="material-symbols-outlined text-xl flex-shrink-0 ${isActive ? 'text-white' : t.icon}">${item.icon}</span>
                              <span class="sidebar-label flex-1 truncate ${isActive ? 'text-white font-extrabold' : ''}">${item.label}</span>
                              ${isActive ? '<span class="w-2 h-2 rounded-full bg-white flex-shrink-0"></span>' : ''}
                            </a>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="p-4 border-t border-outline-variant bg-surface-container/50">
                <div class="flex items-center gap-3">
                  <a href="#/app/profil" onclick="KasRT.Shell.toggleMobileDrawer()" class="flex items-center gap-3 flex-1 min-w-0 hover:opacity-85 transition-opacity group">
                    ${(window.KasRT && window.KasRT.UI && window.KasRT.UI.renderAvatar)
                      ? window.KasRT.UI.renderAvatar(user, 40)
                      : `<div class="w-10 h-10 rounded-2xl bg-theme-gradient text-white font-bold flex items-center justify-center text-sm shadow-sm">${userInitials}</div>`}
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-bold truncate text-on-surface group-hover:text-primary transition-colors">${user?.nama || 'Tamu'}</div>
                      <div class="text-xs font-bold flex items-center gap-1.5" style="color: ${primaryRoleColor}">
                        <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${primaryRoleColor}"></span>
                        <span class="material-symbols-outlined text-[14px] shrink-0">${primaryRoleIcon}</span>
                        <span class="truncate">${primaryRoleName}</span>
                        <span class="text-slate-400 font-normal text-[11px] ml-auto group-hover:text-primary">Edit Profil</span>
                      </div>
                    </div>
                  </a>
                  <button onclick="KasRT.Auth.logout()" title="Keluar" class="w-9 h-9 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer">
                    <span class="material-symbols-outlined text-xl">logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. DESKTOP SIDEBAR -->
          <aside id="kasrt-sidebar" class="hidden md:flex fixed inset-y-0 left-0 z-30 ${activeCollapsed ? 'w-20 sidebar-collapsed' : 'w-64'} bg-surface-lowest border-r border-outline-variant flex-col transition-all duration-300">
            <div class="h-16 px-3.5 border-b border-outline-variant flex items-center justify-between gap-2">
              <a href="${homeRoute}" class="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                ${(window.KasRT && window.KasRT.UI && window.KasRT.UI.renderBrandLogo)
                  ? window.KasRT.UI.renderBrandLogo({ size: 38, isCollapsed: activeCollapsed })
                  : `
                    <div class="w-10 h-10 min-w-10 rounded-2xl bg-theme-gradient text-white flex items-center justify-center font-black font-display text-base shadow-md">R</div>
                    <div class="sidebar-title flex flex-col overflow-hidden transition-opacity duration-200 min-w-0">
                      <span class="font-extrabold text-base tracking-tight text-on-surface font-display">Rukun</span>
                      <span class="text-xs text-slate-500 font-medium truncate max-w-[125px]">${settings.namaOrganisasi || 'RT 01 / RW 01'}</span>
                    </div>
                  `}
              </a>
              <button id="btn-toggle-sidebar" onclick="KasRT.Shell.toggleSidebar()" class="sidebar-collapse-btn w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all flex-shrink-0 cursor-pointer" title="${activeCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}">
                <span id="sidebar-collapse-icon" class="material-symbols-outlined text-[22px] transition-transform">${activeCollapsed ? 'menu_open' : 'menu'}</span>
              </button>
            </div>
            <div class="kasrt-sidebar-scroll flex-1 overflow-y-auto px-2.5 py-2.5 space-y-2.5">
              ${menuSections.map(sec => {
                const t = groupThemes[sec.color] || groupThemes.indigo;
                return `
                  <div class="sidebar-section sidebar-group-card rounded-2xl border ${t.cardBg} ${t.border} p-2 transition-all">
                    <div class="sidebar-section-title px-2 py-1 mb-1 text-xs font-black uppercase tracking-wider ${t.title} flex items-center justify-between">
                      <div class="flex items-center gap-1.5 min-w-0">
                        <span class="w-5 h-5 rounded-md ${t.badge} flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                          <span class="material-symbols-outlined text-sm">${sec.icon || 'folder'}</span>
                        </span>
                        <span class="truncate">${sec.section}</span>
                      </div>
                      <span class="text-xs font-mono opacity-80 font-bold">${sec.items.length}</span>
                    </div>
                    <div class="space-y-0.5">
                      ${sec.items.map(item => {
                        let isActive = false;
                        if (item.route.includes('?')) {
                          isActive = currentRoute.hash === item.route;
                        } else {
                          isActive = (currentRoute.hash === item.route || currentRoute.path === item.route.replace('#', '')) && !currentRoute.hash.includes('?');
                        }
                        return `
                          <a href="${item.route}" title="${item.label}" class="sidebar-link ${isActive ? 'is-active text-white ' + t.active : `text-slate-700 dark:text-slate-200 ${t.hover}`} flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all relative group">
                            <span class="material-symbols-outlined text-xl flex-shrink-0 ${isActive ? 'text-white' : t.icon}">${item.icon}</span>
                            <span class="sidebar-label truncate ${isActive ? 'text-white font-extrabold' : ''}">${item.label}</span>
                            ${isActive ? '<span class="sidebar-label ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>' : ''}
                          </a>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="p-2.5 border-t border-outline-variant bg-surface-container/30">
              <a href="#/app/profil" title="Klik untuk mengedit profil Anda" class="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-surface-container/80 transition-all group cursor-pointer">
                ${(window.KasRT && window.KasRT.UI && window.KasRT.UI.renderAvatar)
                  ? window.KasRT.UI.renderAvatar(user, 36)
                  : `<div class="w-9 h-9 min-w-9 rounded-xl bg-theme-gradient text-white font-bold flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-transform">${userInitials}</div>`}
                <div class="sidebar-label flex-1 min-w-0">
                  <div class="text-sm font-bold truncate text-on-surface leading-tight group-hover:text-primary transition-colors">${user?.nama || 'Pengguna RT'}</div>
                  <div class="text-xs font-bold flex items-center gap-1.5" style="color: ${primaryRoleColor}">
                    <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${primaryRoleColor}"></span>
                    <span class="material-symbols-outlined text-[13px] shrink-0">${primaryRoleIcon}</span>
                    <span class="truncate">${primaryRoleName}</span>
                    <span class="text-slate-400 text-xs ml-auto group-hover:text-primary">Edit</span>
                  </div>
                </div>
                <button onclick="event.preventDefault(); event.stopPropagation(); KasRT.Auth.logout()" title="Keluar dari akun" class="sidebar-label w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-lg">logout</span>
                </button>
              </a>
              ${isDemo ? `
                <div class="sidebar-label mt-1.5 pt-1.5 border-t border-outline-variant/60 flex items-center justify-between gap-1">
                  <span class="text-xs text-amber-600 dark:text-amber-400 font-bold shrink-0">Role Demo:</span>
                  <select onchange="KasRT.Auth.demoLogin(this.value)" class="text-xs font-semibold bg-surface-lowest border border-outline-variant rounded-lg px-2 py-1 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[125px] truncate">
                    ${allAvailableRoles.map(r => `
                      <option value="${r.id}" ${primaryRole === r.id ? 'selected' : ''}>${r.name}</option>
                    `).join('')}
                  </select>
                </div>
              ` : ''}
            </div>
          </aside>

          <!-- 3. MAIN CONTENT -->
          <div id="kasrt-main-content" class="flex-1 flex flex-col ${activeCollapsed ? 'md:pl-20' : 'md:pl-64'} transition-all duration-300">
            <!-- TOPBAR -->
            <header class="h-16 px-4 sm:px-6 bg-surface-lowest/95 backdrop-blur-md border-b border-outline-variant sticky top-0 z-30 flex items-center justify-between gap-3 shadow-2xs">
              <div class="flex items-center gap-2.5 min-w-0">
                <button onclick="KasRT.Shell.toggleMobileDrawer()" class="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer" title="Buka Menu Samping">
                  <span class="material-symbols-outlined text-2xl">menu</span>
                </button>
                <div class="flex items-center gap-2 min-w-0 pl-0.5 sm:pl-1">
                  <span class="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 animate-pulse hidden sm:inline-block"></span>
                  <h1 class="font-extrabold text-sm sm:text-base text-on-surface font-display truncate max-w-[180px] sm:max-w-xs md:max-w-sm">${title}</h1>
                </div>
              </div>
              <div class="hidden md:flex items-center flex-1 max-w-sm mx-4 min-w-[200px]">
                <button type="button" onclick="KasRT.UI.toggleCommandPalette()" class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface-container/60 hover:bg-surface-container text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 border border-outline-variant/60 transition-all text-sm group cursor-pointer shadow-2xs">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="material-symbols-outlined text-lg text-slate-400 group-hover:text-primary transition-colors shrink-0">search</span>
                    <span class="font-medium text-slate-500 dark:text-slate-400 truncate">Cari transaksi, warga, menu...</span>
                  </div>
                  <kbd class="px-2 py-0.5 rounded-md bg-surface-lowest text-xs font-mono text-slate-500 border border-outline-variant shadow-2xs shrink-0">Ctrl+K</kbd>
                </button>
              </div>
              <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button onclick="KasRT.UI.toggleCommandPalette()" title="Pencarian Cepat" class="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-surface-container transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-xl">search</span>
                </button>
                ${canViewDbMonitor ? `
                  <a href="#/app/db-monitor" title="Status Basis Data: ${monitorState.statusLabel || 'Online'} (${monitorState.latencyMs}ms)" class="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    monitorState.status === 'ONLINE'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : (monitorState.status === 'OFFLINE_LOCAL'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse')
                  }">
                    <span class="w-2 h-2 rounded-full ${monitorState.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : (monitorState.status === 'OFFLINE_LOCAL' ? 'bg-amber-500' : 'bg-rose-500')}"></span>
                    <span class="material-symbols-outlined text-base">dns</span>
                    <span class="hidden xl:inline">${monitorState.status === 'ONLINE' ? 'DB Online' : (monitorState.status === 'OFFLINE_LOCAL' ? 'DB Lokal' : 'DB Kendala')}</span>
                    <span class="font-mono opacity-90">${monitorState.latencyMs}ms</span>
                  </a>
                ` : ''}
                ${isDemo ? `
                  <div class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <span class="text-xs text-amber-700 dark:text-amber-400 font-black uppercase tracking-wider">Role:</span>
                    <select onchange="KasRT.Auth.demoLogin(this.value)" class="text-xs font-bold bg-transparent text-amber-900 dark:text-amber-200 focus:outline-none cursor-pointer py-0.5 max-w-[140px] truncate">
                      ${allAvailableRoles.map(r => `
                        <option value="${r.id}" ${primaryRole === r.id ? 'selected' : ''}>${r.name}</option>
                      `).join('')}
                    </select>
                  </div>
                ` : ''}
                <button onclick="KasRT.UI.openThemePickerModal()" title="Pilih Tema Warna & Gradien Modern" class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary hover:bg-surface-container transition-colors relative cursor-pointer">
                  <span class="material-symbols-outlined text-xl">palette</span>
                </button>
                <button onclick="KasRT.Shell.showNotificationModal()" title="Pemberitahuan Sistem" class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-surface-container relative transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-xl">notifications</span>
                  ${unreadNotifCount > 0 ? `
                    <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-surface-lowest"></span>
                  ` : ''}
                </button>
                <button onclick="KasRT.Theme.toggle()" title="Ganti Mode Gelap / Terang" class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-surface-container transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-xl dark:hidden">dark_mode</span>
                  <span class="material-symbols-outlined text-xl hidden dark:inline">light_mode</span>
                </button>
                <a href="#/app/profil" title="Profil Saya (Klik untuk edit)" class="flex items-center gap-2.5 pl-2.5 border-l border-outline-variant hover:opacity-85 transition-opacity group">
                  ${(window.KasRT && window.KasRT.UI && window.KasRT.UI.renderAvatar)
                    ? window.KasRT.UI.renderAvatar(user, 36)
                    : `<div class="w-9 h-9 rounded-xl bg-theme-gradient text-white font-black flex items-center justify-center text-xs shadow-2xs group-hover:scale-105 transition-transform">${userInitials}</div>`}
                  <div class="hidden xl:flex flex-col text-left">
                    <span class="text-sm font-bold leading-tight text-on-surface truncate max-w-[120px] group-hover:text-primary transition-colors">${user?.nama || 'Profil'}</span>
                    <span class="text-xs text-slate-400 font-medium">${primaryRole}</span>
                  </div>
                </a>
              </div>
            </header>
            <main class="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto pb-20 md:pb-6">
              ${contentHtml}
            </main>
          </div>

          <!-- FLOATING MOBILE DOCK (STANDAR UKURAN APLIKASI) -->
          <nav class="md:hidden fixed bottom-2 sm:bottom-3 inset-x-2 sm:inset-x-3 bg-surface-lowest/95 backdrop-blur-lg border border-outline-variant rounded-2xl py-2 px-3 z-40 shadow-xl flex items-center justify-around">
            ${isWarga ? `
              <a href="#/app/portal" class="flex flex-col items-center gap-1 text-xs font-bold ${currentRoute.hash === '#/app/portal' ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}">
                <span class="material-symbols-outlined text-xl">home</span>
                <span>Portal</span>
              </a>
              <a href="#/app/portal-tagihan" class="flex flex-col items-center gap-1 text-xs font-bold ${currentRoute.hash.includes('tagihan') ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}">
                <span class="material-symbols-outlined text-xl">payments</span>
                <span>Tagihan</span>
              </a>
              <a href="#/app/portal-cicilan" class="flex flex-col items-center gap-1 text-xs font-bold ${currentRoute.hash.includes('cicilan') ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}">
                <span class="material-symbols-outlined text-xl">schedule</span>
                <span>Cicilan</span>
              </a>
              <a href="#/app/profil" class="flex flex-col items-center gap-1 text-xs font-bold ${currentRoute.hash.includes('profil') ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}">
                <span class="material-symbols-outlined text-xl">person</span>
                <span>Profil</span>
              </a>
              <button onclick="KasRT.Shell.toggleMobileDrawer()" class="flex flex-col items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary cursor-pointer">
                <span class="material-symbols-outlined text-xl">menu</span>
                <span>Menu</span>
              </button>
            ` : `
              <a href="#/app/dashboard" class="flex flex-col items-center gap-1 text-xs font-bold ${currentRoute.hash === '#/app/dashboard' ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}">
                <span class="material-symbols-outlined text-xl">dashboard</span>
                <span>Beranda</span>
              </a>
              <a href="#/app/transaksi" class="flex flex-col items-center gap-1 text-xs font-bold ${currentRoute.hash.includes('transaksi') ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}">
                <span class="material-symbols-outlined text-xl">receipt_long</span>
                <span>Kas</span>
              </a>
              <a href="#/app/iuran" class="flex flex-col items-center gap-1 text-xs font-bold ${currentRoute.hash.includes('iuran') ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}">
                <span class="material-symbols-outlined text-xl">payments</span>
                <span>Iuran</span>
              </a>
              <a href="#/app/profil" class="flex flex-col items-center gap-1 text-xs font-bold ${currentRoute.hash.includes('profil') ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}">
                <span class="material-symbols-outlined text-xl">person</span>
                <span>Profil</span>
              </a>
              <button onclick="KasRT.Shell.toggleMobileDrawer()" class="flex flex-col items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary cursor-pointer">
                <span class="material-symbols-outlined text-xl">menu</span>
                <span>Menu</span>
              </button>
            `}
          </nav>
        </div>
      `;
    },

    showNotificationModal() {
      const db = window.KasRT && window.KasRT.DB;
      const notifications = (db && db.list('notifications')) || [];
      const html = `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center">
                <span class="material-symbols-outlined">notifications</span>
              </div>
              <div>
                <h3 class="font-bold text-base text-on-surface">Pemberitahuan Sistem</h3>
                <p class="text-xs text-slate-500">${notifications.length} notifikasi tercatat</p>
              </div>
            </div>
            <button onclick="KasRT.Shell.markAllNotificationsRead()" class="text-xs font-semibold text-primary hover:underline cursor-pointer">Tandai Semua Dibaca</button>
          </div>
          <div class="max-h-80 overflow-y-auto space-y-3">
            ${notifications.length === 0 ? `
              <div class="py-8 text-center text-slate-400 text-xs">Belum ada notifikasi baru</div>
            ` : notifications.map(n => `
              <div class="p-3.5 rounded-2xl border border-outline-variant ${n.dibaca ? 'bg-surface-container/30 opacity-70' : 'bg-surface-lowest shadow-sm'}">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-xs font-bold text-on-surface">${n.judul}</h4>
                  <span class="text-[10px] text-slate-400 font-mono">${window.KasRT.Utils.relTime(n.createdAt)}</span>
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">${n.pesan}</p>
              </div>
            `).join('')}
          </div>
          <div class="pt-4 mt-4 border-t border-outline-variant flex justify-end">
            <button onclick="KasRT.UI.closeModal()" class="px-5 py-2 text-xs font-bold text-white bg-primary rounded-xl cursor-pointer">Tutup</button>
          </div>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async markAllNotificationsRead() {
      const db = window.KasRT && window.KasRT.DB;
      if (!db) return;
      const notifications = db.list('notifications') || [];
      for (const n of notifications) {
        if (!n.dibaca) {
          await db.update('notifications', n.id, { dibaca: true });
        }
      }
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast('Semua notifikasi ditandai telah dibaca.', 'success');
        window.KasRT.UI.closeModal();
      }
    }
  };

  document.addEventListener('keydown', (e) => {
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      if (e.key === '[') {
        Shell.toggleSidebar();
      } else if (e.key === 'm' || e.key === 'M') {
        Shell.showMegaMenu();
      }
    }
  });

  window.KasRT = window.KasRT || {};
  window.KasRT.Shell = Shell;
  window.KasRT_Shell_Loaded = true;
})();
