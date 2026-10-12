/**
 * KasRT - Firebase Configuration, Diagnostics & Credential Management
 * Pengaturan Kredensial Firebase untuk koneksi database Cloud Firestore & Authentication
 * Dilengkapi validasi keamanan ketat, live connection tester, dan pencatatan audit log otomatis
 */
(function() {
  'use strict';
  if (window.KasRT_FirebaseConfig_Loaded) return;

  const DEFAULT_CONFIG = {
    apiKey: "AIzaSyAApUtIO6xnm0RdWLTl20e5RW2PlLOpq_s",
    authDomain: "kasrt-74e7c.firebaseapp.com",
    projectId: "kasrt-74e7c",
    storageBucket: "kasrt-74e7c.firebasestorage.app",
    messagingSenderId: "179020518058",
    appId: "1:179020518058:web:dd1cc28e17172de8ecf6d3",
    databaseURL: ""
  };

  const STORAGE_KEY = 'kasrt_custom_firebase_cfg';

  let savedCustomConfig = {};
  try {
    const rawStored = localStorage.getItem(STORAGE_KEY);
    if (rawStored) {
      savedCustomConfig = JSON.parse(rawStored);
    }
  } catch (e) {
    console.warn('[KasRT Firebase] Failed reading saved config:', e);
  }

  const userOverride = (typeof window !== 'undefined' && window.__KASRT_CONFIG__) || savedCustomConfig || {};
  let activeConfig = Object.assign({}, DEFAULT_CONFIG, userOverride);

  function isPlaceholder(val) {
    if (!val || typeof val !== 'string') return true;
    return val.includes('GANTI_DENGAN') ||
           val.includes('kasrt-app') ||
           val.startsWith('AIzaSy_GANTI');
  }

  function validateFirebaseConfig(cfg) {
    const issues = [];
    const fields = ['apiKey', 'authDomain', 'projectId', 'appId'];
    for (const f of fields) {
      if (!cfg[f] || !String(cfg[f]).trim()) {
        issues.push(`Field "${f}" wajib diisi.`);
      } else if (isPlaceholder(cfg[f])) {
        issues.push(`Field "${f}" masih bernilai placeholder default.`);
      }
    }

    if (cfg.apiKey && !isPlaceholder(cfg.apiKey)) {
      if (!cfg.apiKey.startsWith('AIzaSy') && cfg.apiKey.length < 20) {
        issues.push('Format Web API Key Firebase tidak valid (biasanya dimulai dengan "AIzaSy...").');
      }
    }

    if (cfg.projectId && !isPlaceholder(cfg.projectId)) {
      if (!/^[a-z0-9-]+$/.test(cfg.projectId)) {
        issues.push('Project ID Firebase hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).');
      }
    }

    const isHttps = typeof window !== 'undefined' && (
      window.location.protocol === 'https:' ||
      (window.location.hostname || '') === 'localhost' ||
      (window.location.hostname || '') === '127.0.0.1' ||
      (window.location.hostname || '').endsWith('run.app') ||
      (window.location.hostname || '').endsWith('github.io')
    );

    if (!isHttps) {
      issues.push('Koneksi browser bukan HTTPS atau localhost. Firebase Auth mewajibkan secure context (HTTPS).');
    }

    const isValid = issues.length === 0;
    return {
      isValid,
      isConfigured: !isPlaceholder(cfg.apiKey) && !isPlaceholder(cfg.projectId),
      issues,
      isHttps
    };
  }

  let diagnostics = validateFirebaseConfig(activeConfig);
  let FIREBASE_ENABLED = diagnostics.isConfigured && diagnostics.isValid;

  function initFirebaseSdk() {
    if (window.firebase && FIREBASE_ENABLED) {
      try {
        if (window.firebase.apps && window.firebase.apps.length > 0) {
          const existingApp = window.firebase.app();
          existingApp.delete().then(() => {
            window.firebase.initializeApp(activeConfig);
            console.info('[KasRT] Firebase SDK diinisialisasi ulang dengan project:', activeConfig.projectId);
          }).catch(() => {
            window.firebase.initializeApp(activeConfig);
          });
        } else {
          window.firebase.initializeApp(activeConfig);
          console.info('[KasRT] Firebase SDK diinisialisasi:', activeConfig.projectId);
        }
      } catch (e) {
        console.warn('[KasRT] Gagal menginisialisasi Firebase SDK:', e);
      }
    }
  }

  initFirebaseSdk();

  function getRawConfig() {
    return Object.assign({}, activeConfig);
  }

  function getMaskedConfig() {
    return {
      apiKey: activeConfig.apiKey ? (activeConfig.apiKey.length > 10 ? activeConfig.apiKey.slice(0, 6) + '...' + activeConfig.apiKey.slice(-4) : '***') : '',
      authDomain: activeConfig.authDomain || '',
      projectId: activeConfig.projectId || '',
      storageBucket: activeConfig.storageBucket || '',
      messagingSenderId: activeConfig.messagingSenderId || '',
      appId: activeConfig.appId ? (activeConfig.appId.length > 15 ? activeConfig.appId.slice(0, 8) + '...' + activeConfig.appId.slice(-4) : '***') : '',
      databaseURL: activeConfig.databaseURL || ''
    };
  }

  function getFirebaseDiagnostics() {
    diagnostics = validateFirebaseConfig(activeConfig);
    return {
      enabled: FIREBASE_ENABLED,
      config: getMaskedConfig(),
      rawConfig: getRawConfig(),
      diagnostics,
      isConfigured: diagnostics.isConfigured,
      hasCustomConfig: !!localStorage.getItem(STORAGE_KEY)
    };
  }

  async function testConnection(cfgToTest = null) {
    const cfg = cfgToTest || activeConfig;
    const validation = validateFirebaseConfig(cfg);
    if (!validation.isValid && !validation.isConfigured) {
      return {
        success: false,
        latencyMs: 0,
        error: 'Kredensial belum lengkap atau masih menggunakan placeholder: ' + validation.issues.join('; ')
      };
    }

    const startTime = performance.now();
    try {
      if (!window.firebase || !window.firebase.initializeApp) {
        throw new Error('Firebase Compat SDK belum terpasang atau diblokir oleh browser.');
      }

      const testAppName = `test_app_${Date.now()}`;
      const testApp = window.firebase.initializeApp(cfg, testAppName);
      const testDb = testApp.firestore();

      await Promise.race([
        testDb.collection('_health_check').doc('ping').get(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Koneksi batas waktu habis (Timeout 6s). Periksa API Key dan aturan Firestore.')), 6000))
      ]);

      const latencyMs = Math.round(performance.now() - startTime);

      try {
        await testApp.delete();
      } catch (e) {}

      return {
        success: true,
        latencyMs,
        projectId: cfg.projectId,
        message: `Koneksi ke Firebase Project "${cfg.projectId}" berhasil! Latensi: ${latencyMs} ms.`
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        latencyMs,
        error: err.message || 'Gagal tersambung ke Firebase.'
      };
    }
  }

  async function saveConfig(newCfg, currentUser = null) {
    const auth = window.KasRT && window.KasRT.Auth;
    const adminUser = currentUser || (auth ? auth.user : null);

    if (!auth || !auth.Permissions.isAdmin(adminUser)) {
      throw new Error('Akses Ditolak: Hanya Administrator yang berwenang mengubah kredensial Firebase Database.');
    }

    const validation = validateFirebaseConfig(newCfg);
    if (!validation.isConfigured) {
      throw new Error('Kredensial Firebase tidak boleh kosong atau masih bernilai placeholder default.');
    }

    const cleanCfg = {
      apiKey: String(newCfg.apiKey || '').trim(),
      authDomain: String(newCfg.authDomain || '').trim(),
      projectId: String(newCfg.projectId || '').trim(),
      storageBucket: String(newCfg.storageBucket || '').trim(),
      messagingSenderId: String(newCfg.messagingSenderId || '').trim(),
      appId: String(newCfg.appId || '').trim(),
      databaseURL: String(newCfg.databaseURL || '').trim()
    };

    const oldMasked = getMaskedConfig();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanCfg));
      activeConfig = Object.assign({}, DEFAULT_CONFIG, cleanCfg);
      diagnostics = validateFirebaseConfig(activeConfig);
      FIREBASE_ENABLED = diagnostics.isConfigured && diagnostics.isValid;
      initFirebaseSdk();
      const newMasked = getMaskedConfig();

      const db = window.KasRT && window.KasRT.DB;
      if (db) {
        await db.log(
          adminUser?.id || 'admin',
          'UPDATE_FIREBASE_CREDENTIALS',
          'settings_firebase',
          cleanCfg.projectId,
          oldMasked,
          newMasked
        );
      }

      if (window.KasRT && window.KasRT.DBMonitor) {
        window.KasRT.DBMonitor.logActivity(
          'SUCCESS',
          'FIREBASE_CREDENTIALS_UPDATED',
          `Kredensial Firebase Project "${cleanCfg.projectId}" diperbarui oleh Administrator ${adminUser?.nama || 'Admin'}.`,
          {
            projectId: cleanCfg.projectId,
            adminId: adminUser?.id,
            adminNama: adminUser?.nama,
            maskedApiKey: newMasked.apiKey
          }
        );
      }

      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('firebase:config:updated', activeConfig);
      }

      return {
        success: true,
        projectId: cleanCfg.projectId,
        masked: newMasked
      };
    } catch (err) {
      console.error('[KasRT Firebase] Gagal menyimpan kredensial:', err);
      throw new Error('Gagal menyimpan kredensial: ' + err.message);
    }
  }

  async function resetConfig(currentUser = null) {
    const auth = window.KasRT && window.KasRT.Auth;
    const adminUser = currentUser || (auth ? auth.user : null);
    if (!auth || !auth.Permissions.isAdmin(adminUser)) {
      throw new Error('Akses Ditolak: Hanya Administrator yang berwenang mereset kredensial Firebase.');
    }

    const oldMasked = getMaskedConfig();
    try {
      localStorage.removeItem(STORAGE_KEY);
      activeConfig = Object.assign({}, DEFAULT_CONFIG);
      diagnostics = validateFirebaseConfig(activeConfig);
      FIREBASE_ENABLED = false;

      if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
        try {
          await window.firebase.app().delete();
        } catch (e) {}
      }

      const db = window.KasRT && window.KasRT.DB;
      if (db) {
        await db.log(
          adminUser?.id || 'admin',
          'RESET_FIREBASE_CREDENTIALS',
          'settings_firebase',
          'default_offline',
          oldMasked,
          { status: 'Reset ke Mode Demo Offline Default' }
        );
      }

      if (window.KasRT && window.KasRT.DBMonitor) {
        window.KasRT.DBMonitor.logActivity(
          'WARNING',
          'FIREBASE_CREDENTIALS_RESET',
          `Kredensial Firebase dikembalikan ke Mode Offline Bawaan oleh Administrator ${adminUser?.nama || 'Admin'}.`,
          {
            adminId: adminUser?.id,
            adminNama: adminUser?.nama
          }
        );
      }

      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('firebase:config:updated', activeConfig);
      }

      return true;
    } catch (err) {
      throw new Error('Gagal mereset kredensial: ' + err.message);
    }
  }

  const FirebaseConfigModule = {
    get firebaseConfig() { return activeConfig; },
    get FIREBASE_ENABLED() { return FIREBASE_ENABLED; },
    getRawConfig,
    getMaskedConfig,
    getFirebaseDiagnostics,
    validateFirebaseConfig,
    testConnection,
    saveConfig,
    resetConfig
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.FirebaseConfig = FirebaseConfigModule;
  window.KasRT_FirebaseConfig_Loaded = true;
})();
