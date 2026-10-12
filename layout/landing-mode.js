/**
 * KasRT - Landing Mode Manager
 * Mengatur Mode Demo vs Mode Produksi pada Landing Page & Banner Sistem
 */
(function() {
  'use strict';
  if (window.KasRT_LandingMode_Loaded) return;

  const LS_MODE_KEY = 'kasrt_landing_mode';

  const LandingMode = {
    getMode() {
      const db = window.KasRT && window.KasRT.DB;
      const cachedMode = localStorage.getItem(LS_MODE_KEY);
      if (!db) {
        return cachedMode || 'demo';
      }
      const settings = db.get('settings', 'global') || {};
      const actualMode = settings.landingMode || cachedMode || 'demo';
      return actualMode;
    },

    isDemo() {
      return this.getMode() === 'demo';
    },

    async setMode(mode) {
      const auth = window.KasRT && window.KasRT.Auth;
      if (!auth || !auth.Permissions.isAdmin()) {
        throw new Error('Hanya Administrator yang berwenang mengubah mode tampilan sistem.');
      }
      const validMode = mode === 'production' ? 'production' : 'demo';
      
      // Simpan ke localStorage terlebih dahulu untuk determinisme instan
      try {
        localStorage.setItem(LS_MODE_KEY, validMode);
      } catch (e) {}

      // Simpan ke database (settings/global)
      if (window.KasRT && window.KasRT.DB) {
        await window.KasRT.DB.update('settings', 'global', {
          landingMode: validMode
        });
      }

      if (window.KasRT && window.KasRT.UI) {
        window.KasRT.UI.showToast(`Mode aplikasi diubah ke: ${validMode === 'production' ? 'Produksi (Resmi)' : 'Demonstrasi'}`, 'info');
      }

      // Picu event dan re-render seketika
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('mode:changed', { mode: validMode });
        window.KasRT.Events.handleRouting();
      }

      return validMode;
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.LandingMode = LandingMode;
  window.KasRT_LandingMode_Loaded = true;
})();