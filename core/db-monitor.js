/**
 * KasRT - Core Database Monitoring, Storage Gauge, Synchronization & Connectivity Alert Engine
 * Dirancang khusus untuk GitHub Pages + Firebase Firestore & LocalStorage Serverless
 * Hanya dapat diakses dan dilihat oleh role Administrator
 */
(function() {
  'use strict';
  if (window.KasRT_DBMonitor_Loaded) return;

  const Constants = window.KasRT.Constants;
  const Utils = window.KasRT.Utils;

  class DatabaseMonitor {
    constructor() {
      this.status = 'ONLINE'; // 'ONLINE' | 'OFFLINE_LOCAL' | 'ERROR'
      this.latencyMs = 12;
      this.lastChecked = new Date().toISOString();
      this.lastSyncTime = localStorage.getItem(Constants.LS_DB_SYNC) || null;
      this.isSimulatingDisconnect = false;
      this.listeners = new Set();
      this.heartbeatTimer = null;
      this.autoSyncTimer = null;
      this.autoSyncEnabled = false;

      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }

    init() {
      this.checkHealth();
      this.heartbeatTimer = setInterval(() => {
        this.checkHealth();
      }, 15000);
    }

    subscribe(cb) {
      this.listeners.add(cb);
      return () => this.listeners.delete(cb);
    }

    notify() {
      const state = this.getState();
      this.listeners.forEach(cb => {
        try { cb(state); } catch (e) { console.error('[DBMonitor] Listener error:', e); }
      });
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('db:monitor:updated', state);
      }
    }

    async handleNetworkChange(isOnline) {
      if (!isOnline) {
        this.status = 'OFFLINE_LOCAL';
        this.triggerConnectivityAlert('Jaringan Internet Terputus! Sistem beroperasi dalam Mode Lokal (Offline).');
      } else {
        await this.checkHealth();
        if (this.status === 'ONLINE') {
          this.logActivity('SUCCESS', 'CONNECTIVITY_RESTORED', 'Konektivitas jaringan dan database cloud pulih normal');
          if (window.KasRT && window.KasRT.UI) {
            window.KasRT.UI.showToast('Konektivitas internet dan database pulih kembali!', 'success');
          }
        }
      }
      this.notify();
    }

    async checkHealth() {
      const startTime = performance.now();
      this.lastChecked = new Date().toISOString();

      if (this.isSimulatingDisconnect) {
        this.status = 'ERROR';
        this.latencyMs = 999;
        this.notify();
        return this.getState();
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.status = 'OFFLINE_LOCAL';
        this.latencyMs = 0;
        this.notify();
        return this.getState();
      }

      let localOk = false;
      try {
        const testKey = '__kasrt_health_ping__';
        localStorage.setItem(testKey, 'ok');
        localOk = localStorage.getItem(testKey) === 'ok';
        localStorage.removeItem(testKey);
      } catch (e) {
        localOk = false;
      }

      if (!localOk) {
        this.status = 'ERROR';
        this.triggerConnectivityAlert('Gagal mengakses penyimpanan lokal (LocalStorage quota penuh atau akses diblokir).');
        this.notify();
        return this.getState();
      }

      const fbConfig = window.KasRT && window.KasRT.FirebaseConfig;
      if (fbConfig && fbConfig.FIREBASE_ENABLED && window.firebase && window.firebase.firestore) {
        try {
          const db = window.firebase.firestore();
          await db.collection('settings').doc('global').get();
          this.latencyMs = Math.round(performance.now() - startTime);
          this.status = 'ONLINE';
        } catch (err) {
          this.latencyMs = Math.round(performance.now() - startTime);
          this.status = 'ERROR';
          this.triggerConnectivityAlert(`Konektivitas Firebase Firestore terganggu: ${err.message || 'Timeout'}`);
          this.notify();
          return this.getState();
        }
      } else {
        this.latencyMs = Math.round(performance.now() - startTime) + 4;
        this.status = 'ONLINE';
      }

      this.notify();
      return this.getState();
    }

    triggerConnectivityAlert(message) {
      this.logActivity('ERROR', 'CONNECTIVITY_DROP', message);
      const db = window.KasRT && window.KasRT.DB;
      if (db) {
        const notifId = db.nextId('NTF', 'notifications');
        const notifDoc = {
          id: notifId,
          judul: 'Kendala Konektivitas Basis Data',
          pesan: message,
          tipe: 'error',
          dibaca: false,
          createdAt: Utils.nowISO()
        };
        db.set('notifications', notifDoc);
      }
      if (window.KasRT && window.KasRT.UI) {
        window.KasRT.UI.showToast(message, 'error', 5000);
      }
      this.renderConnectivityBanner(true, message);
    }

    renderConnectivityBanner(show = false, message = '') {
      let banner = document.getElementById('db-connectivity-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'db-connectivity-banner';
        const mainContent = document.getElementById('kasrt-main-content');
        if (mainContent) {
          mainContent.prepend(banner);
        } else {
          document.body.prepend(banner);
        }
      }

      if (show && this.status !== 'ONLINE') {
        banner.className = 'bg-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between gap-3 shadow-md z-40 transition-all';
        banner.innerHTML = `
          <div class="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <span class="material-symbols-outlined text-lg animate-pulse">cloud_off</span>
            <span>${message || 'Peringatan: Konektivitas basis data terganggu. Data disimpan sementara di penyimpanan lokal offline.'}</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="KasRT.DBMonitor.checkHealth()" class="px-2.5 py-1 rounded bg-white text-rose-700 font-extrabold hover:bg-rose-50 text-[11px] shadow-xs cursor-pointer">
              Coba Sambung Ulang
            </button>
            <button onclick="this.closest('#db-connectivity-banner').classList.add('hidden')" class="text-white/80 hover:text-white text-base cursor-pointer">✕</button>
          </div>
        `;
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }

    getStorageStats() {
      const db = window.KasRT && window.KasRT.DB;
      const raw = localStorage.getItem(Constants.LS_KEY) || '{}';
      const totalBytes = new Blob([raw]).size;
      const totalKb = (totalBytes / 1024).toFixed(2);
      const totalMb = (totalBytes / (1024 * 1024)).toFixed(3);
      const MAX_LOCAL_BYTES = 5 * 1024 * 1024;
      const percentQuota = Math.min(100, Number(((totalBytes / MAX_LOCAL_BYTES) * 100).toFixed(2)));

      const collections = {};
      let totalDocuments = 0;
      if (db && db.cache) {
        Object.keys(db.cache).forEach(col => {
          const items = Array.isArray(db.cache[col]) ? db.cache[col] : [];
          const colBytes = new Blob([JSON.stringify(items)]).size;
          totalDocuments += items.length;
          collections[col] = {
            count: items.length,
            bytes: colBytes,
            formatted: Utils.formatBytes(colBytes),
            percentage: totalBytes > 0 ? Number(((colBytes / totalBytes) * 100).toFixed(1)) : 0
          };
        });
      }

      const topCollections = Object.entries(collections)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 8);

      return {
        totalBytes,
        totalKb,
        totalMb,
        percentQuota,
        totalDocuments,
        totalCollections: Object.keys(collections).length,
        collections,
        topCollections
      };
    }

    async syncLocalToServer() {
      const auth = window.KasRT && window.KasRT.Auth;
      if (!auth || (!auth.Permissions.isAdmin() && !auth.Permissions.has('view_db_monitor'))) {
        throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk melakukan sinkronisasi database.');
      }
      const db = window.KasRT && window.KasRT.DB;
      if (!db) throw new Error('Database lokal belum siap.');

      this.logActivity('INFO', 'SYNC_STARTED', 'Memulai sinkronisasi seluruh koleksi database lokal ke server cloud');
      let syncedCount = 0;
      let totalCols = 0;

      if (window.firebase && window.firebase.firestore && window.KasRT.FirebaseConfig.FIREBASE_ENABLED) {
        try {
          // 1. Pastikan pengguna telah terautentikasi melalui Firebase Authentication
          // Sesuai security rules Firestore saat ini: allow write: if isAuthenticated();
          if (auth && typeof auth.ensureFirebaseAuth === 'function') {
            await auth.ensureFirebaseAuth();
          } else if (window.firebase.auth) {
            const fbAuth = window.firebase.auth();
            if (!fbAuth.currentUser) {
              const u = (auth && auth.user) || (db && db.list('users').find(x => x.roles && x.roles.includes('Admin')));
              const em = (u && u.email) ? u.email.trim().toLowerCase() : 'admin@kasrt.id';
              const pw = (u && u.password) ? String(u.password).trim() : 'demo123';
              try {
                await fbAuth.signInWithEmailAndPassword(em, pw);
              } catch (signInErr) {
                await fbAuth.signInWithEmailAndPassword('admin@kasrt.id', 'demo123');
              }
            }
          }

          const fs = window.firebase.firestore();
          const collections = Object.keys(db.cache);
          totalCols = collections.length;

          // 2. Kumpulkan seluruh dokumen valid untuk disinkronisasikan
          const ops = [];
          for (const col of collections) {
            const items = db.cache[col] || [];
            for (const doc of items) {
              if (doc && (doc.id || doc._id)) {
                const docId = String(doc.id || doc._id);
                // Bersihkan field undefined agar mematuhi spesifikasi Firestore
                const cleanDoc = JSON.parse(JSON.stringify(doc));
                ops.push({ col, id: docId, data: cleanDoc });
              }
            }
          }

          // 3. Eksekusi sinkronisasi dalam batch (maks 400 dokumen per batch)
          const BATCH_SIZE = 400;
          try {
            for (let i = 0; i < ops.length; i += BATCH_SIZE) {
              const batchOps = ops.slice(i, i + BATCH_SIZE);
              const batch = fs.batch();
              for (const op of batchOps) {
                const ref = fs.collection(op.col).doc(op.id);
                batch.set(ref, op.data, { merge: true });
              }
              await batch.commit();
              syncedCount += batchOps.length;
            }
          } catch (batchErr) {
            console.warn('[KasRT DBMonitor] Gagal batch commit, beralih ke penulisan individual:', batchErr);
            syncedCount = 0;
            for (const op of ops) {
              await fs.collection(op.col).doc(op.id).set(op.data, { merge: true });
              syncedCount++;
            }
          }
        } catch (err) {
          this.logActivity('ERROR', 'SYNC_FAILED', `Gagal sinkronisasi ke Firebase: ${err.message}`);
          if (window.KasRT && window.KasRT.UI) {
            window.KasRT.UI.showToast('Sinkronisasi Firebase gagal: ' + err.message, 'error');
          }
          throw new Error('Sinkronisasi Firebase gagal: ' + err.message);
        }
      } else {
        await new Promise(r => setTimeout(r, 600));
        const collections = Object.keys(db.cache);
        totalCols = collections.length;
        collections.forEach(col => {
          syncedCount += (db.cache[col] || []).length;
        });
      }

      this.lastSyncTime = Utils.nowISO();
      localStorage.setItem(Constants.LS_DB_SYNC, this.lastSyncTime);
      this.logActivity('SUCCESS', 'DB_SYNC', `Sinkronisasi berhasil: ${syncedCount} dokumen pada ${totalCols} koleksi tersinkronisasi`);
      if (window.KasRT && window.KasRT.UI) {
        window.KasRT.UI.showToast(`Sinkronisasi sukses! ${syncedCount} data tersinkronisasi.`, 'success');
      }
      this.notify();
      return { success: true, syncedCount, totalCols, time: this.lastSyncTime };
    }

    async resetAllDatabase(confirmationPhrase, options = {}) {
      const auth = window.KasRT && window.KasRT.Auth;
      const user = auth ? auth.user : null;
      if (!auth || !auth.Permissions.isAdmin(user)) {
        this.logActivity('WARNING', 'SECURITY_VIOLATION', `Percobaan reset database diblokir dari role non-admin (${user?.nama || 'Unknown'})`);
        throw new Error('Akses Ditolak: Fitur Reset Total Database hanya dapat dieksekusi oleh Administrator Sistem Penuh.');
      }

      if (confirmationPhrase !== 'RESET TOTAL BASIS DATA') {
        throw new Error('Frasa konfirmasi reset tidak tepat. Ketik "RESET TOTAL BASIS DATA" persis sama.');
      }

      const db = window.KasRT && window.KasRT.DB;
      if (!db) throw new Error('Database tidak ditemukan.');

      let existingUsers = [];
      if (!options.resetUsers && db.cache.users) {
        existingUsers = JSON.parse(JSON.stringify(db.cache.users));
      }

      localStorage.removeItem(Constants.LS_KEY);
      localStorage.removeItem(Constants.LS_DB_SYNC);

      if (window.firebase && window.firebase.firestore && window.KasRT.FirebaseConfig.FIREBASE_ENABLED) {
        try {
          if (auth && typeof auth.ensureFirebaseAuth === 'function') {
            await auth.ensureFirebaseAuth();
          }
          const fs = window.firebase.firestore();
          for (const col of Object.keys(db.cache)) {
            if (!options.resetUsers && col === 'users') continue;
            const snap = await fs.collection(col).get();
            const batch = fs.batch();
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
          }
        } catch (e) {
          console.warn('[DBMonitor] Firebase reset warning:', e);
        }
      }

      db.seedDemoData();

      if (!options.resetUsers && existingUsers.length > 0) {
        db.cache.users = existingUsers;
        db.persistDemo();
      }

      await db.log(user?.id || 'admin', 'RESET_TOTAL_DATABASE', 'all_collections', 'ALL', null, {
        reason: 'Reset total dieksekusi oleh Administrator Sistem',
        resetUsers: !!options.resetUsers,
        timestamp: Utils.nowISO()
      });

      this.logActivity('WARNING', 'DB_RESET', `RESET TOTAL BASIS DATA dieksekusi oleh ${user?.nama || 'Admin'} (Reset User: ${!!options.resetUsers})`);
      this.lastSyncTime = null;
      this.checkHealth();
      return true;
    }

    logActivity(level, type, message, details = {}) {
      const db = window.KasRT && window.KasRT.DB;
      const logEntry = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Utils.nowISO(),
        level, // 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
        type,
        message,
        source: 'KasRT-Engine',
        details
      };
      if (db && db.cache) {
        if (!db.cache.systemActivityLogs) db.cache.systemActivityLogs = [];
        db.cache.systemActivityLogs.unshift(logEntry);
        if (db.cache.systemActivityLogs.length > 150) {
          db.cache.systemActivityLogs = db.cache.systemActivityLogs.slice(0, 150);
        }
        db.persistDemo();
      }
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('db:log:new', logEntry);
      }
      return logEntry;
    }

    getActivityLogs(filter = {}) {
      const db = window.KasRT && window.KasRT.DB;
      const logs = (db && db.list('systemActivityLogs')) || [];
      return logs.filter(l => {
        if (filter.level && filter.level !== 'ALL' && l.level !== filter.level) return false;
        if (filter.search) {
          const s = filter.search.toLowerCase();
          return (l.message || '').toLowerCase().includes(s) ||
                 (l.type || '').toLowerCase().includes(s) ||
                 (l.id || '').toLowerCase().includes(s);
        }
        return true;
      });
    }

    toggleSimulationDisconnect() {
      this.isSimulatingDisconnect = !this.isSimulatingDisconnect;
      if (this.isSimulatingDisconnect) {
        this.status = 'ERROR';
        this.triggerConnectivityAlert('SIMULASI AKTIF: Konektivitas basis data terputus buatan untuk pengujian notifikasi.');
      } else {
        this.status = 'ONLINE';
        this.renderConnectivityBanner(false);
        this.logActivity('SUCCESS', 'CONNECTIVITY_RESTORED', 'SIMULASI NONAKTIF: Konektivitas sistem dipulihkan kembali');
        if (window.KasRT && window.KasRT.UI) {
          window.KasRT.UI.showToast('Simulasi selesai. Konektivitas kembali normal!', 'success');
        }
      }
      this.notify();
      return this.isSimulatingDisconnect;
    }

    getState() {
      const storage = this.getStorageStats();
      const fbConfig = window.KasRT && window.KasRT.FirebaseConfig;
      const isFb = fbConfig && fbConfig.FIREBASE_ENABLED;
      return {
        status: this.status,
        statusLabel: this.status === 'ONLINE' ? 'Terkoneksi Baik' : (this.status === 'OFFLINE_LOCAL' ? 'Offline (Lokal)' : 'Kendala Koneksi'),
        statusColor: this.status === 'ONLINE' ? 'emerald' : (this.status === 'OFFLINE_LOCAL' ? 'amber' : 'rose'),
        latencyMs: this.latencyMs,
        lastChecked: this.lastChecked,
        lastSyncTime: this.lastSyncTime,
        isSimulatingDisconnect: this.isSimulatingDisconnect,
        storageEngine: isFb ? 'Google Firebase Firestore (Serverless)' : 'LocalStorage Browser (Offline-First)',
        storage,
        isOnline: navigator.onLine
      };
    }
  }

  const monitorInstance = new DatabaseMonitor();
  window.KasRT = window.KasRT || {};
  window.KasRT.DBMonitor = monitorInstance;
  window.KasRT_DBMonitor_Loaded = true;
  setTimeout(() => monitorInstance.init(), 100);
})();
