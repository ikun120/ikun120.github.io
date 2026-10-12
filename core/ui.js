/**
 * KasRT - Core UI System & Modern Gradient Theme Engine
 * Toast dengan progress bar, Modal & Drawer responsif, Command Palette (Ctrl+K),
 * Material Design 3 tokens, dan Pilihan Tema Warna Gradien Terang & Gelap
 */
(function() {
  'use strict';
  if (window.KasRT_UI_Loaded) return;

  const Constants = window.KasRT.Constants;

  const Theme = {
    currentMode: 'light',
    currentAccent: 'indigo',
    currentGradient: 'indigo-violet',
    init() {
      const savedMode = localStorage.getItem(Constants.LS_THEME) || 'light';
      const savedAccent = localStorage.getItem(Constants.LS_ACCENT) || 'indigo';
      const savedGradient = localStorage.getItem(Constants.LS_GRADIENT) || 'indigo-violet';
      this.setGradient(savedGradient, false);
      this.setAccent(savedAccent, false);
      this.applyMode(savedMode, false);

      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        try {
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (this.currentMode === 'system') {
              this.applyMode('system', false);
            }
          });
        } catch (e) {}
      }
    },
    applyMode(mode, save = true) {
      this.currentMode = mode;
      if (save) localStorage.setItem(Constants.LS_THEME, mode);
      const html = document.documentElement;
      let isDark = false;
      if (mode === 'dark') {
        isDark = true;
      } else if (mode === 'system') {
        isDark = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      if (html && html.classList) {
        if (isDark) {
          html.classList.add('dark');
          html.style.colorScheme = 'dark';
        } else {
          html.classList.remove('dark');
          html.style.colorScheme = 'light';
        }
      }
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('theme:changed', { mode, isDark, gradient: this.currentGradient });
      }
    },
    toggle() {
      const html = document.documentElement;
      const next = (html && html.classList && html.classList.contains('dark')) ? 'light' : 'dark';
      this.applyMode(next);
      return next;
    },
    setAccent(accentKey, save = true) {
      const accent = Constants.ACCENTS[accentKey] || Constants.ACCENTS.indigo;
      this.currentAccent = accentKey;
      if (save) localStorage.setItem(Constants.LS_ACCENT, accentKey);
      const root = document.documentElement;
      if (root && root.style) {
        root.style.setProperty('--c-primary', accent.primary);
        root.style.setProperty('--c-primary-container', accent.container);
        root.style.setProperty('--c-primary-fixed', accent.fixed);
      }
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('accent:changed', accent);
      }
    },
    setGradient(gradientKey, save = true) {
      let grad = Constants.GRADIENTS[gradientKey];
      if (!grad && gradientKey === 'default-royal') grad = Constants.GRADIENTS['default'];
      if (!grad) grad = Constants.GRADIENTS['default'] || Constants.GRADIENTS['indigo-violet'];
      const actualKey = grad.id || gradientKey;
      this.currentGradient = actualKey;
      if (save) localStorage.setItem(Constants.LS_GRADIENT, actualKey);
      const root = document.documentElement;
      if (root && root.style) {
        root.style.setProperty('--grad-start', grad.start);
        root.style.setProperty('--grad-via', grad.via);
        root.style.setProperty('--grad-end', grad.end);
        root.style.setProperty('--grad-glow', `${grad.start}33`);

        const toRgb = (hex) => {
          if (!hex) return '79, 70, 229';
          const c = hex.replace('#', '');
          if (c.length === 3) {
            return `${parseInt(c[0]+c[0],16)}, ${parseInt(c[1]+c[1],16)}, ${parseInt(c[2]+c[2],16)}`;
          }
          return `${parseInt(c.slice(0,2),16)||0}, ${parseInt(c.slice(2,4),16)||0}, ${parseInt(c.slice(4,6),16)||0}`;
        };
        root.style.setProperty('--grad-start-rgb', toRgb(grad.start));
        root.style.setProperty('--grad-via-rgb', toRgb(grad.via));
        root.style.setProperty('--grad-end-rgb', toRgb(grad.end));
      }
      if (grad.accentKey && Constants.ACCENTS[grad.accentKey]) {
        this.setAccent(grad.accentKey, save);
      } else {
        const matchingAccent = Object.keys(Constants.ACCENTS).find(k => Constants.ACCENTS[k].hex.toLowerCase() === grad.start.toLowerCase());
        if (matchingAccent) {
          this.setAccent(matchingAccent, save);
        }
      }
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('gradient:changed', grad);
      }
    }
  };

  const UI = {
    getLogoSvg(size = 40, className = '') {
      const uid = 'kasrt-logo-' + Math.floor(Math.random() * 10000);
      return `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: ${size}px; height: ${size}px;" class="shrink-0 ${className}">
          <defs>
            <linearGradient id="${uid}-bg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="var(--grad-start, #4f46e5)"/>
              <stop offset="52%" stop-color="var(--grad-via, #7c3aed)"/>
              <stop offset="100%" stop-color="var(--grad-end, #0ea5e9)"/>
            </linearGradient>
            <linearGradient id="${uid}-coin" x1="23" y1="23" x2="41" y2="43" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="35%" stop-color="#facc15"/>
              <stop offset="100%" stop-color="#d97706"/>
            </linearGradient>
            <linearGradient id="${uid}-glass" x1="0" y1="0" x2="64" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.32"/>
              <stop offset="65%" stop-color="#ffffff" stop-opacity="0.06"/>
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
            </linearGradient>
            <filter id="${uid}-shadow" x="0" y="2" width="64" height="62" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" flood-color="#1e1b4b" flood-opacity="0.28"/>
            </filter>
          </defs>
          <!-- 1. Background Squircle Badge -->
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#${uid}-bg)" filter="url(#${uid}-shadow)"/>
          <rect x="4" y="4" width="56" height="56" rx="18" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.2"/>
          <!-- 2. Gloss Highlight Curve -->
          <path d="M4 22C4 12 12 4 22 4H42C52 4 60 12 60 22C44 28 20 22 4 22Z" fill="url(#${uid}-glass)"/>
          
          <!-- 3. Atap Bangunan / Pelindung Rukun Tetangga (Community Shelter) -->
          <path d="M32 12.5L50 26.5H44V45.5C44 46.9 42.9 48 41.5 48H22.5C21.1 48 20 46.9 20 45.5V26.5H14L32 12.5Z" fill="#ffffff" fill-opacity="0.12"/>
          <path d="M32 14.5L47 26.5H42.5V45C42.5 45.8 41.8 46.5 41 46.5H23C22.2 46.5 21.5 45.8 21.5 45V26.5H17L32 14.5Z" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
          
          <!-- 4. Gelombang Landasan Harmoni & Gotong Royong -->
          <path d="M16 41C20.5 45 26 47 32 47C38 47 43.5 45 48 41" stroke="#38bdf8" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.95"/>
          
          <!-- 5. Koin Kas Emas Transparan (RT Treasury Coin) -->
          <circle cx="32" cy="33.5" r="9.5" fill="url(#${uid}-coin)" stroke="#ffffff" stroke-width="1.8"/>
          <circle cx="32" cy="33.5" r="7.5" fill="none" stroke="#b45309" stroke-width="0.9" stroke-dasharray="2 1.5"/>
          
          <!-- 6. Monogram Simbol Rp (Rupiah Kas RT) -->
          <path d="M29 30V37M29 33H32.2C33.3 33 34.2 32.3 34.2 31.4C34.2 30.5 33.3 30 32.2 30H29ZM32 33.2L34.5 37" stroke="#78350f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    },

    renderBrandLogo({ size = 40, showSubtitle = true, subtitle = '', isCollapsed = false, isLight = false } = {}) {
      const db = window.KasRT && window.KasRT.DB;
      const settings = (db && db.get('settings', 'global')) || {};
      const appName = settings.appName || 'Kas RT';
      const appTagline = settings.appTagline || 'Kas Transparan';
      const orgName = subtitle || appTagline || settings.namaOrganisasi || 'RT 01 / RW 01';
      const customLogo = settings.appLogoCustom && settings.appLogoCustom.trim();

      const logoNode = customLogo
        ? `<img src="${customLogo}" alt="${appName}" class="shrink-0 rounded-2xl object-contain drop-shadow-md border border-white/20 bg-white/10 p-0.5" style="width: ${size}px; height: ${size}px; max-width: ${size}px; max-height: ${size}px;" onerror="this.onerror=null; this.outerHTML=KasRT.UI.getLogoSvg(${size});" />`
        : this.getLogoSvg(size);

      return `
        <div class="flex items-center gap-3 overflow-hidden min-w-0">
          <div class="shrink-0 transition-transform duration-200 hover:scale-105 drop-shadow-md flex items-center justify-center">
            ${logoNode}
          </div>
          ${!isCollapsed ? `
            <div class="flex flex-col min-w-0 overflow-hidden text-left leading-tight">
              <span class="font-extrabold text-base sm:text-lg tracking-tight font-display ${isLight ? 'text-white' : 'text-on-surface'} truncate max-w-[200px]">${appName}</span>
              ${showSubtitle ? `<span class="text-xs ${isLight ? 'text-white/80' : 'text-slate-500'} font-medium truncate max-w-[180px] mt-0.5">${orgName}</span>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    },

    renderAvatar(user, size = 36, className = '') {
      const nama = user?.nama || 'Pengguna';
      const initials = (window.KasRT?.Utils?.initials ? window.KasRT.Utils.initials(nama) : (nama.charAt(0) || 'U')).toUpperCase();
      const avatarUrl = user?.avatarUrl;
      const px = typeof size === 'number' ? `${size}px` : size;
      const fontSize = Math.max(10, Math.floor(parseInt(px, 10) * 0.36));

      if (avatarUrl && avatarUrl.trim()) {
        return `
          <div class="relative shrink-0 overflow-hidden rounded-2xl shadow-2xs border border-outline-variant/60 flex items-center justify-center bg-surface-container ${className}" style="width: ${px}; height: ${px};">
            <img src="${avatarUrl}" alt="${nama}" class="w-full h-full object-cover rounded-2xl" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
            <div class="hidden w-full h-full rounded-2xl bg-theme-gradient text-white font-black flex items-center justify-center shadow-2xs" style="font-size: ${fontSize}px;">
              ${initials}
            </div>
          </div>
        `;
      }
      return `
        <div class="shrink-0 rounded-2xl bg-theme-gradient text-white font-black flex items-center justify-center shadow-2xs ${className}" style="width: ${px}; height: ${px}; font-size: ${fontSize}px;">
          ${initials}
        </div>
      `;
    },

    showToast(message, type = 'info', duration = 3500) {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full';
        document.body.appendChild(container);
      }
      const toast = document.createElement('div');
      toast.className = 'pointer-events-auto bg-surface-lowest text-on-surface rounded-2xl shadow-xl border border-outline-variant p-4 flex flex-col overflow-hidden transform transition-all duration-300 translate-y-4 opacity-0';
      const typeStyles = {
        success: { icon: 'check_circle', color: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
        error: { icon: 'error', color: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500' },
        warning: { icon: 'warning', color: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' },
        info: { icon: 'info', color: 'text-indigo-600 dark:text-indigo-400', bar: 'bg-indigo-500' }
      }[type] || { icon: 'info', color: 'text-indigo-600', bar: 'bg-indigo-500' };

      toast.innerHTML = `
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined ${typeStyles.color} text-2xl flex-shrink-0 select-none">${typeStyles.icon}</span>
          <div class="flex-1 text-sm font-medium leading-snug">${message}</div>
          <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none select-none transition-colors ml-1 cursor-pointer" onclick="this.closest('.toast-item')?.remove()">✕</button>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
          <div class="toast-progress ${typeStyles.bar} h-full w-full origin-left transition-transform duration-[${duration}ms] ease-linear"></div>
        </div>
      `;
      toast.classList.add('toast-item');
      container.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
        const bar = toast.querySelector('.toast-progress');
        if (bar) {
          bar.style.transform = 'scaleX(0)';
          bar.style.transition = `transform ${duration}ms linear`;
        }
      });
      const timer = setTimeout(() => {
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, duration);
      toast.addEventListener('mouseenter', () => clearTimeout(timer));
    },

    openModal(contentHtml, options = {}) {
      const container = document.getElementById('modal-container') || document.body;
      let modalOverlay = document.getElementById('kasrt-active-modal');
      if (modalOverlay) {
        modalOverlay.remove();
      }
      const sizeClass = {
        sm: 'w-[95vw] sm:w-full max-w-md',
        md: 'w-[95vw] sm:w-full max-w-xl',
        lg: 'w-[98vw] sm:w-full max-w-3xl',
        xl: 'w-[98vw] sm:w-full max-w-5xl',
        full: 'w-[98vw] sm:w-full max-w-7xl'
      }[options.size || 'md'];

      modalOverlay = document.createElement('div');
      modalOverlay.id = 'kasrt-active-modal';
      modalOverlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200';
      modalOverlay.innerHTML = `
        <div class="bg-surface-lowest text-on-surface rounded-3xl shadow-2xl border border-outline-variant ${sizeClass} max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-200 scale-95 opacity-0 animate-scale-in">
          ${contentHtml}
        </div>
      `;
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay && !options.disableBackdropClose) {
          UI.closeModal();
        }
      });
      const onEsc = (e) => {
        if (e.key === 'Escape') {
          UI.closeModal();
          document.removeEventListener('keydown', onEsc);
        }
      };
      document.addEventListener('keydown', onEsc);
      modalOverlay._onEsc = onEsc;
      container.appendChild(modalOverlay);
      requestAnimationFrame(() => {
        const dialog = modalOverlay.querySelector('.animate-scale-in');
        if (dialog) {
          dialog.classList.remove('scale-95', 'opacity-0');
        }
      });
    },

    closeModal() {
      const modalOverlay = document.getElementById('kasrt-active-modal');
      if (modalOverlay) {
        if (modalOverlay._onEsc) {
          document.removeEventListener('keydown', modalOverlay._onEsc);
        }
        modalOverlay.classList.add('opacity-0');
        setTimeout(() => modalOverlay.remove(), 150);
      }
    },

    confirmModal({ title = 'Konfirmasi', message, confirmText = 'Lanjutkan', cancelText = 'Batal', danger = false }) {
      return new Promise((resolve) => {
        const html = `
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-2xl flex items-center justify-center ${danger ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'}">
                <span class="material-symbols-outlined">${danger ? 'warning' : 'help_outline'}</span>
              </div>
              <h3 class="text-lg font-bold font-display text-on-surface">${title}</h3>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">${message}</p>
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
              <button id="btn-confirm-cancel" class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                ${cancelText}
              </button>
              <button id="btn-confirm-ok" class="px-5 py-2 text-sm font-bold text-white rounded-xl shadow-md transition-all cursor-pointer ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary hover:opacity-90'}">
                ${confirmText}
              </button>
            </div>
          </div>
        `;
        UI.openModal(html, { size: 'sm' });
        document.getElementById('btn-confirm-cancel')?.addEventListener('click', () => {
          UI.closeModal();
          resolve(false);
        });
        document.getElementById('btn-confirm-ok')?.addEventListener('click', () => {
          UI.closeModal();
          resolve(true);
        });
      });
    },

    promptInputModal({ title, message, placeholder = '', requiredText = '', danger = false }) {
      return new Promise((resolve) => {
        const html = `
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-2xl flex items-center justify-center ${danger ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-indigo-100 text-indigo-600'}">
                <span class="material-symbols-outlined">${danger ? 'delete_forever' : 'edit_square'}</span>
              </div>
              <h3 class="text-lg font-bold font-display text-on-surface">${title}</h3>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">${message}</p>
            ${requiredText ? `<p class="text-xs text-rose-500 font-semibold mb-2">Ketik <code class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold">${requiredText}</code> untuk mengonfirmasi:</p>` : ''}
            <input type="text" id="prompt-modal-input" placeholder="${placeholder}" class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-6 font-semibold" autofocus />
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
              <button id="btn-prompt-cancel" class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                Batal
              </button>
              <button id="btn-prompt-ok" class="px-5 py-2 text-sm font-bold text-white rounded-xl shadow-md transition-all cursor-pointer ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary hover:opacity-90'}">
                Lanjutkan
              </button>
            </div>
          </div>
        `;
        UI.openModal(html, { size: 'sm' });
        const input = document.getElementById('prompt-modal-input');
        document.getElementById('btn-prompt-cancel')?.addEventListener('click', () => {
          UI.closeModal();
          resolve(null);
        });
        document.getElementById('btn-prompt-ok')?.addEventListener('click', () => {
          const val = input ? input.value.trim() : '';
          if (requiredText && val !== requiredText) {
            UI.showToast(`Teks konfirmasi harus tepat: "${requiredText}"`, 'warning');
            return;
          }
          UI.closeModal();
          resolve(val);
        });
        input?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            document.getElementById('btn-prompt-ok')?.click();
          }
        });
      });
    },

    openThemePickerModal() {
      const gradients = Constants.GRADIENTS;
      const currentGrad = Theme.currentGradient;
      const currentMode = Theme.currentMode;
      const html = `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-theme-gradient text-white flex items-center justify-center shadow-md">
                <span class="material-symbols-outlined text-2xl">palette</span>
              </div>
              <div>
                <h3 class="font-extrabold text-lg font-display text-on-surface">Pilihan Tema & Gradien Modern</h3>
                <p class="text-xs text-slate-500">Mendukung mode terang (light) dan gelap (dark) dengan estetika gradien</p>
              </div>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mode Tampilan:</span>
              <span class="text-[11px] text-slate-500">Pilih tema terang, gelap, atau otomatis</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button onclick="KasRT.Theme.applyMode('light'); KasRT.UI.closeModal();" class="p-2 sm:p-2.5 rounded-xl border ${currentMode === 'light' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-outline-variant hover:bg-surface-container'} flex items-center justify-center gap-2 transition-all cursor-pointer">
                <span class="material-symbols-outlined text-lg text-amber-500">light_mode</span>
                <span class="text-xs font-bold text-on-surface">Terang</span>
              </button>
              <button onclick="KasRT.Theme.applyMode('dark'); KasRT.UI.closeModal();" class="p-2 sm:p-2.5 rounded-xl border ${currentMode === 'dark' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-outline-variant hover:bg-surface-container'} flex items-center justify-center gap-2 transition-all cursor-pointer">
                <span class="material-symbols-outlined text-lg text-indigo-400">dark_mode</span>
                <span class="text-xs font-bold text-on-surface">Gelap</span>
              </button>
              <button onclick="KasRT.Theme.applyMode('system'); KasRT.UI.closeModal();" class="p-2 sm:p-2.5 rounded-xl border ${currentMode === 'system' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-outline-variant hover:bg-surface-container'} flex items-center justify-center gap-2 transition-all cursor-pointer">
                <span class="material-symbols-outlined text-lg text-slate-400">settings_brightness</span>
                <span class="text-xs font-bold text-on-surface">Otomatis</span>
              </button>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-2.5">
              <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pilihan Palet Warna Gradien:</span>
                <span class="text-[11px] text-slate-500">12 pilihan gaya tema terpadu (klik untuk terapkan)</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                12 Tema Aktif
              </span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[52vh] overflow-y-auto p-1 pr-1.5">
              ${Object.values(gradients).map(g => {
                const isSelected = currentGrad === g.id;
                const swatches = g.swatches || [g.start, g.via, g.end];
                return `
                  <div onclick="KasRT.Theme.setGradient('${g.id}'); KasRT.UI.closeModal(); KasRT.UI.showToast('Tema diubah ke ${g.name}', 'success');" 
                       title="${g.name} - ${g.description}"
                       class="p-2 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${isSelected ? 'border-primary ring-2 ring-primary/40 shadow-xs bg-primary/5' : 'border-outline-variant hover:border-slate-300 dark:hover:border-slate-600 bg-surface-lowest'} flex flex-col justify-between group">
                    <div>
                      <div class="flex items-center justify-between gap-1 mb-1">
                        <h4 class="font-bold text-[11px] text-on-surface truncate group-hover:text-primary transition-colors pr-1">${g.name}</h4>
                        <div class="flex items-center gap-1 shrink-0">
                          ${g.badge ? `<span class="px-1.5 py-0.5 rounded-md text-[8.5px] font-extrabold ${isSelected ? 'bg-primary text-white' : 'bg-surface-container text-slate-500'}">${g.badge}</span>` : ''}
                          ${isSelected ? '<span class="material-symbols-outlined text-xs text-primary font-bold">check_circle</span>' : ''}
                        </div>
                      </div>
                      <div class="h-6 rounded-lg shadow-2xs mb-1 transition-transform group-hover:scale-[1.01]" style="background: linear-gradient(135deg, ${g.start}, ${g.via}, ${g.end});"></div>
                      <div class="flex items-center gap-0.5 mb-1">
                        ${swatches.map(c => `
                          <span class="flex-1 h-1.5 rounded-[2px]" style="background-color: ${c}" title="${c}"></span>
                        `).join('')}
                      </div>
                      <p class="text-[10px] text-slate-500 leading-tight truncate mb-1" title="${g.description}">${g.description}</p>
                    </div>
                    <div class="flex items-center justify-between pt-1 border-t border-outline-variant/50 text-[9px] text-slate-400">
                      <span class="font-mono">${g.start}</span>
                      <span class="font-bold text-[9.5px] ${isSelected ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}">${isSelected ? '✓ Aktif' : 'Terapkan'}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-outline-variant flex justify-end">
            <button onclick="KasRT.UI.closeModal()" class="px-5 py-2 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-slate-200 cursor-pointer">Tutup</button>
          </div>
        </div>
      `;
      UI.openModal(html, { size: 'lg' });
    },

    toggleCommandPalette() {
      const existing = document.getElementById('kasrt-command-palette');
      if (existing) {
        existing.remove();
        return;
      }
      const menuList = (window.KasRT && window.KasRT.MenuRegistry) ? window.KasRT.MenuRegistry.getForCommandPalette() : [];
      const overlay = document.createElement('div');
      overlay.id = 'kasrt-command-palette';
      overlay.className = 'fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity';
      overlay.innerHTML = `
        <div class="bg-surface-lowest text-on-surface rounded-2xl shadow-2xl border border-outline-variant w-full max-w-xl overflow-hidden animate-scale-in">
          <div class="p-3.5 border-b border-outline-variant flex items-center gap-3">
            <span class="material-symbols-outlined text-slate-400 text-xl">search</span>
            <input type="text" id="cmd-palette-input" placeholder="Ketik perintah atau cari menu... (Ctrl+K)" class="flex-1 bg-transparent text-sm text-on-surface focus:outline-none" autofocus />
            <kbd class="px-2 py-0.5 text-[10px] font-semibold bg-surface-container rounded text-slate-500 border border-outline-variant">ESC</kbd>
          </div>
          <div id="cmd-palette-results" class="max-h-80 overflow-y-auto p-2 space-y-1">
            ${menuList.map(item => `
              <div class="cmd-item flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container cursor-pointer text-sm transition-colors" data-route="${item.route}">
                <span class="material-symbols-outlined text-primary text-lg">${item.icon}</span>
                <div class="flex-1 font-medium">${item.label}</div>
                <span class="text-[10px] text-slate-400 font-mono">${item.section || 'Menu'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          overlay.remove();
          document.removeEventListener('keydown', onKeyDown);
        }
      };
      document.addEventListener('keydown', onKeyDown);
      document.body.appendChild(overlay);

      const input = document.getElementById('cmd-palette-input');
      const results = document.getElementById('cmd-palette-results');
      input?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const items = results.querySelectorAll('.cmd-item');
        items.forEach(el => {
          const text = el.textContent.toLowerCase();
          el.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
      results?.addEventListener('click', (e) => {
        const item = e.target.closest('.cmd-item');
        if (item) {
          const route = item.dataset.route;
          overlay.remove();
          if (route && window.KasRT.Events) {
            window.KasRT.Events.navigate(route);
          }
        }
      });
    }
  };

  const ResidentPicker = {
    _configs: {},
    _activeDropdownId: null,
    render(options = {}) {
      const id = options.id || 'res-picker-' + Math.random().toString(36).substring(2, 9);
      const db = window.KasRT.DB;
      const residents = options.residents || (db ? db.list('residents').filter(r => r.status === 'Aktif') : []);
      
      this._configs[id] = { ...options, residents };
      let selectedName = '';
      if (options.selectedId) {
        const found = residents.find(r => r.id === options.selectedId);
        if (found) selectedName = found.nama;
      }
      const placeholder = options.placeholder || 'Ketik nama warga untuk mencari...';
      const customClass = options.customClass || '';
      const safeSelectedName = (selectedName || '').replace(/"/g, '&quot;');
      const safePlaceholder = (placeholder || '').replace(/"/g, '&quot;');

      return `
        <div class="relative kasrt-resident-picker-root ${customClass}" data-picker-id="${id}">
          <input 
            type="hidden" 
            id="${id}" 
            name="${options.name || id}" 
            value="${options.selectedId || ''}" 
            data-selected-name="${safeSelectedName}"
            ${options.required ? 'data-required="true"' : ''}
          />
          <div class="relative flex items-center">
            <span class="material-symbols-outlined text-slate-400 text-sm absolute left-3 pointer-events-none select-none">search</span>
            <input 
              type="text" 
              id="${id}-search" 
              value="${safeSelectedName}" 
              placeholder="${safePlaceholder}" 
              autocomplete="off"
              ${options.required ? 'required' : ''}
              onfocus="KasRT.UI.ResidentPicker.onFocus('${id}')" 
              onblur="KasRT.UI.ResidentPicker.onBlur('${id}')"
              oninput="KasRT.UI.ResidentPicker.onSearch('${id}', this.value)"
              onkeydown="KasRT.UI.ResidentPicker.onKeyDown(event, '${id}')"
              class="w-full pl-9 pr-14 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400"
            />
            <div class="absolute right-1.5 flex items-center gap-0.5">
              <button 
                type="button" 
                id="${id}-clear-btn" 
                onclick="KasRT.UI.ResidentPicker.clear('${id}')"
                title="Hapus pilihan"
                class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-md transition-colors ${selectedName ? '' : 'hidden'}"
              >
                <span class="material-symbols-outlined text-xs">close</span>
              </button>
              <button 
                type="button" 
                id="${id}-toggle-btn" 
                onclick="KasRT.UI.ResidentPicker.toggleDropdown('${id}')"
                title="Tampilkan daftar nama warga"
                class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-base transition-transform" id="${id}-chevron">expand_more</span>
              </button>
            </div>
          </div>
          <div 
            id="${id}-dropdown" 
            class="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface-lowest rounded-2xl border border-outline-variant shadow-xl max-h-60 overflow-y-auto hidden divide-y divide-outline-variant/30 py-1"
          ></div>
        </div>
      `;
    },
    getResidents(id) {
      const config = this._configs[id] || {};
      if (config.residents && config.residents.length > 0) return config.residents;
      const db = window.KasRT.DB;
      const list = db ? db.list('residents').filter(r => r.status === 'Aktif') : [];
      if (!this._configs[id]) this._configs[id] = {};
      this._configs[id].residents = list;
      return list;
    },
    openDropdown(id) {
      const dropdown = document.getElementById(`${id}-dropdown`);
      const chevron = document.getElementById(`${id}-chevron`);
      if (dropdown) {
        dropdown.classList.remove('hidden');
        this._activeDropdownId = id;
      }
      if (chevron) {
        chevron.classList.add('rotate-180');
      }
    },
    closeDropdown(id) {
      const dropdown = document.getElementById(`${id}-dropdown`);
      const chevron = document.getElementById(`${id}-chevron`);
      if (dropdown) {
        dropdown.classList.add('hidden');
        if (this._activeDropdownId === id) {
          this._activeDropdownId = null;
        }
      }
      if (chevron) {
        chevron.classList.remove('rotate-180');
      }
    },
    toggleDropdown(id) {
      const dropdown = document.getElementById(`${id}-dropdown`);
      if (!dropdown) return;
      if (dropdown.classList.contains('hidden')) {
        const searchInput = document.getElementById(`${id}-search`);
        this.openDropdown(id);
        this.renderList(id, searchInput ? searchInput.value : '');
        searchInput?.focus();
      } else {
        this.closeDropdown(id);
      }
    },
    onFocus(id) {
      this.openDropdown(id);
      const searchInput = document.getElementById(`${id}-search`);
      this.renderList(id, searchInput ? searchInput.value : '');
    },
    onBlur(id) {
      setTimeout(() => {
        const hidden = document.getElementById(id);
        const search = document.getElementById(`${id}-search`);
        if (!hidden || !search) return;
        const typed = search.value.trim().toLowerCase();
        if (!typed) {
          this.select(id, '', '');
          return;
        }
        const residents = this.getResidents(id);
        const selectedName = (hidden.getAttribute('data-selected-name') || '').toLowerCase();
        if (typed !== selectedName) {
          const exact = residents.find(r => (r.nama || '').toLowerCase() === typed);
          if (exact) {
            this.select(id, exact.id, exact.nama);
          } else {
            const partials = residents.filter(r => (r.nama || '').toLowerCase().includes(typed));
            if (partials.length === 1) {
              this.select(id, partials[0].id, partials[0].nama);
            }
          }
        }
      }, 250);
    },
    onSearch(id, query) {
      this.openDropdown(id);
      this.renderList(id, query);
      const clearBtn = document.getElementById(`${id}-clear-btn`);
      if (clearBtn) {
        if (query.trim().length > 0) {
          clearBtn.classList.remove('hidden');
        } else {
          const hiddenVal = document.getElementById(id)?.value;
          if (!hiddenVal) clearBtn.classList.add('hidden');
        }
      }
    },
    onKeyDown(event, id) {
      if (event.key === 'Escape') {
        this.closeDropdown(id);
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const dropdown = document.getElementById(`${id}-dropdown`);
        if (dropdown && !dropdown.classList.contains('hidden')) {
          const firstItem = dropdown.querySelector('[data-res-id]');
          if (firstItem) {
            const resId = firstItem.getAttribute('data-res-id');
            const resNama = firstItem.getAttribute('data-res-nama');
            this.select(id, resId, resNama);
            return;
          }
        }
        const search = document.getElementById(`${id}-search`);
        if (search) {
          const typed = search.value.trim().toLowerCase();
          const residents = this.getResidents(id);
          const matched = residents.find(r => (r.nama || '').toLowerCase() === typed) ||
                          residents.find(r => (r.nama || '').toLowerCase().includes(typed));
          if (matched) {
            this.select(id, matched.id, matched.nama);
          }
        }
        this.closeDropdown(id);
      }
    },
    renderList(id, query = '') {
      const config = this._configs[id] || {};
      const residents = this.getResidents(id);
      const dropdown = document.getElementById(`${id}-dropdown`);
      if (!dropdown) return;
      const q = (query || '').toLowerCase().trim();
      const currentVal = document.getElementById(id)?.value || '';
      let filtered = residents;
      if (q) {
        filtered = residents.filter(r => (r.nama || '').toLowerCase().includes(q));
      }
      let html = '';
      if (config.allowEmpty && !q) {
        const isSelected = !currentVal;
        const emptyLbl = config.emptyLabel || '-- Tanpa Relasi Warga --';
        const jsSafeEmptyLbl = emptyLbl.replace(/'/g, "\\'");
        html += `
          <div 
            onclick="KasRT.UI.ResidentPicker.select('${id}', '', '${jsSafeEmptyLbl}')"
            class="px-3.5 py-2.5 hover:bg-surface-container cursor-pointer text-xs text-slate-500 italic transition-colors flex items-center justify-between ${isSelected ? 'bg-primary/5 font-semibold text-primary' : ''}"
          >
            <span>${emptyLbl}</span>
            ${isSelected ? '<span class="material-symbols-outlined text-sm text-primary">check</span>' : ''}
          </div>
        `;
      }
      if (filtered.length === 0) {
        html += `
          <div class="px-3.5 py-3 text-xs text-slate-400 italic text-center">
            Tidak ada warga dengan nama "${query.replace(/</g, '&lt;')}"
          </div>
        `;
      } else {
        html += filtered.map(r => {
          const isSelected = r.id === currentVal;
          const escapedName = (r.nama || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const jsSafeName = (r.nama || '').replace(/'/g, "\\'");
          return `
            <div 
              data-res-id="${r.id}"
              data-res-nama="${escapedName}"
              onclick="KasRT.UI.ResidentPicker.select('${id}', '${r.id}', '${jsSafeName}')"
              class="px-3.5 py-2.5 hover:bg-primary/10 hover:text-primary cursor-pointer flex items-center justify-between text-xs transition-colors group ${isSelected ? 'bg-primary/10 font-bold text-primary' : 'text-on-surface'}"
            >
              <span class="font-bold group-hover:translate-x-0.5 transition-transform">${escapedName}</span>
              ${isSelected ? '<span class="material-symbols-outlined text-sm text-primary">check</span>' : ''}
            </div>
          `;
        }).join('');
      }
      dropdown.innerHTML = html;
    },
    select(id, resId, resNama) {
      const hidden = document.getElementById(id);
      const search = document.getElementById(`${id}-search`);
      const clearBtn = document.getElementById(`${id}-clear-btn`);
      if (hidden) {
        hidden.value = resId || '';
        hidden.setAttribute('data-selected-name', resNama || '');
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
        hidden.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (search) {
        search.value = resNama || '';
        search.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (clearBtn) {
        if (resId || (search && search.value)) {
          clearBtn.classList.remove('hidden');
        } else {
          clearBtn.classList.add('hidden');
        }
      }
      this.closeDropdown(id);
    },
    clear(id) {
      this.select(id, '', '');
      const search = document.getElementById(`${id}-search`);
      if (search) {
        search.focus();
        this.openDropdown(id);
        this.renderList(id, '');
      }
    }
  };

  const formatCurrencyInput = function(input) {
    if (!input) return;
    const val = input.value || '';
    const selStart = input.selectionStart !== null && input.selectionStart !== undefined ? input.selectionStart : val.length;
    const digitsBeforeCursor = (val.slice(0, selStart).match(/\d/g) || []).length;
    const rawDigits = val.replace(/\D/g, '');
    if (!rawDigits) {
      input.value = '';
      return;
    }
    const cleanDigits = rawDigits.replace(/^0+(?=\d)/, '');
    const formatted = cleanDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = formatted;

    if (typeof input.setSelectionRange === 'function') {
      let newCursor = 0;
      let digitsCount = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          digitsCount++;
        }
        if (digitsCount === digitsBeforeCursor) {
          newCursor = i + 1;
          break;
        }
      }
      if (digitsBeforeCursor === 0) newCursor = 0;
      if (digitsCount < digitsBeforeCursor) newCursor = formatted.length;
      input.setSelectionRange(newCursor, newCursor);
    }
  };

  const setCurrencyValue = function(inputOrId, value) {
    const el = typeof inputOrId === 'string' ? document.getElementById(inputOrId) : inputOrId;
    if (!el) return;
    if (value === '' || value === null || value === undefined) {
      el.value = '';
    } else {
      const num = window.KasRT?.Utils ? window.KasRT.Utils.parseNumber(value) : (Number(value) || 0);
      el.value = window.KasRT?.Utils ? window.KasRT.Utils.formatRpNumber(num) : String(num).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const renderCurrencyInput = function(options = {}) {
    const id = options.id || 'curr-' + Math.random().toString(36).substring(2, 9);
    const Utils = window.KasRT?.Utils;
    const value = options.value !== undefined && options.value !== null && options.value !== ''
      ? (Utils ? Utils.formatRpNumber(options.value) : String(options.value).replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
      : '';
    const placeholder = options.placeholder || '0';
    const required = options.required ? 'required' : '';
    const customClass = options.class || options.className || '';
    const oninput = options.oninput || '';
    return `
      <div class="relative flex items-center w-full">
        <span class="absolute left-3.5 font-bold font-mono text-slate-400 dark:text-slate-500 select-none pointer-events-none text-xs sm:text-sm">Rp</span>
        <input
          type="text"
          inputmode="numeric"
          id="${id}"
          name="${options.name || id}"
          value="${value}"
          placeholder="${placeholder}"
          data-currency="rupiah"
          autocomplete="off"
          ${required}
          oninput="KasRT.UI.formatCurrencyInput(this); ${oninput}"
          class="w-full pl-10 sm:pl-11 pr-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-base font-black font-mono focus:ring-2 focus:ring-primary ${customClass}"
        />
      </div>
    `;
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('input', (e) => {
      const t = e.target;
      if (t && t.matches && (t.matches('input[data-currency="rupiah"]') || t.matches('input.currency-input') || t.matches('input[data-type="currency"]'))) {
        formatCurrencyInput(t);
      }
    });

    document.addEventListener('keydown', (e) => {
      const t = e.target;
      if (t && t.matches && (t.matches('input[data-currency="rupiah"]') || t.matches('input.currency-input') || t.matches('input[data-type="currency"]'))) {
        if (e.key === 'Backspace' && t.selectionStart === t.selectionEnd) {
          const pos = t.selectionStart;
          if (pos > 0 && t.value[pos - 1] === '.') {
            e.preventDefault();
            const before = t.value.slice(0, pos - 2);
            const after = t.value.slice(pos);
            t.value = before + after;
            formatCurrencyInput(t);
            const newPos = Math.max(0, pos - 2);
            t.setSelectionRange(newPos, newPos);
          }
        }
      }
    });

    document.addEventListener('paste', (e) => {
      const t = e.target;
      if (t && t.matches && (t.matches('input[data-currency="rupiah"]') || t.matches('input.currency-input') || t.matches('input[data-type="currency"]'))) {
        setTimeout(() => {
          formatCurrencyInput(t);
        }, 0);
      }
    });

    document.addEventListener('click', (e) => {
      const root = e.target.closest('.kasrt-resident-picker-root');
      const openRoots = document.querySelectorAll('.kasrt-resident-picker-root');
      openRoots.forEach(r => {
        if (r !== root) {
          const pickerId = r.dataset.pickerId;
          if (pickerId && window.KasRT?.UI?.ResidentPicker) {
            window.KasRT.UI.ResidentPicker.closeDropdown(pickerId);
          }
        }
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      UI.toggleCommandPalette();
    }
  });

  window.KasRT = window.KasRT || {};
  UI.formatCurrencyInput = formatCurrencyInput;
  UI.setCurrencyValue = setCurrencyValue;
  UI.renderCurrencyInput = renderCurrencyInput;
  window.KasRT.UI = UI;
  window.KasRT.UI.ResidentPicker = ResidentPicker;
  window.KasRT.UI.renderResidentSearchSelect = (opts) => ResidentPicker.render(opts);
  window.KasRT.UI.renderResidentOptions = (residents = [], selectedId = '') => {
    return residents.map(r => `<option value="${r.id}" ${r.id === selectedId ? 'selected' : ''}>${r.nama}</option>`).join('');
  };
  window.KasRT.Theme = Theme;
  window.KasRT_UI_Loaded = true;
})();
