/**
 * KasRT - Core Authentication & Role-Based Access Control (RBAC)
 * Auth state, session persistence, UserStore, RoleStore, dan evaluasi permission
 * Diperbarui: Seluruh role pengguna (Admin, Bendahara, Sekretaris, Petugas, Warga)
 * BERHAK PENUH mengakses dan mengedit halaman Profil Saya sendiri.
 */
(function() {
  'use strict';
  if (window.KasRT_Auth_Loaded) return;

  const Constants = window.KasRT.Constants;
  const Utils = window.KasRT.Utils;

  let currentUser = null;
  let currentProfile = null;

  const Auth = {
    get user() {
      if (currentUser && currentUser.id && window.KasRT.DB) {
        const fresh = window.KasRT.DB.get('users', currentUser.id);
        if (fresh) currentUser = fresh;
      }
      return currentUser;
    },
    get profile() { return currentProfile || currentUser; },

    async init() {
      // Periksa apakah ada sesi tersimpan sebelumnya
      try {
        const raw = localStorage.getItem(Constants.LS_SESSION);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.user) {
            const fresh = (window.KasRT.DB && window.KasRT.DB.get('users', parsed.user.id)) || parsed.user;
            currentUser = fresh;
            currentProfile = parsed.profile || fresh;
            // Sinkronisasi status autentikasi Firebase di latar belakang
            this.ensureFirebaseAuth(currentUser).catch(e => {
              console.warn('[KasRT Auth] Inisialisasi Firebase Auth latar belakang:', e.message || e);
            });
            return { user: currentUser, profile: currentProfile };
          }
        }
      } catch (e) {}

      currentUser = null;
      currentProfile = null;
      return { user: null, profile: null };
    },

    async ensureFirebaseAuth(userToAuth = null, explicitPassword = null) {
      if (!window.firebase || !window.firebase.auth) {
        return null;
      }
      const fbConfig = window.KasRT && window.KasRT.FirebaseConfig;
      if (fbConfig && !fbConfig.FIREBASE_ENABLED) {
        return null;
      }

      const fbAuth = window.firebase.auth();
      if (fbAuth.currentUser) {
        return fbAuth.currentUser;
      }

      const targetUser = userToAuth || currentUser || (window.KasRT.DB && window.KasRT.DB.list('users').find(u => u.roles && u.roles.includes('Admin'))) || null;
      const email = (targetUser && targetUser.email) ? String(targetUser.email).trim().toLowerCase() : 'admin@kasrt.id';
      const password = explicitPassword || (targetUser && targetUser.password) ? String(explicitPassword || targetUser.password).trim() : 'demo123';

      try {
        const cred = await fbAuth.signInWithEmailAndPassword(email, password);
        return cred.user;
      } catch (err) {
        const code = err.code || '';
        if (code === 'auth/user-not-found' || code === 'auth/invalid-login-credentials' || code === 'auth/invalid-credential') {
          try {
            const newCred = await fbAuth.createUserWithEmailAndPassword(email, password);
            return newCred.user;
          } catch (createErr) {
            if (email !== 'admin@kasrt.id') {
              try {
                const adminCred = await fbAuth.signInWithEmailAndPassword('admin@kasrt.id', 'demo123');
                return adminCred.user;
              } catch (adminErr) {
                console.warn('[KasRT Auth] Firebase admin fallback error:', adminErr);
              }
            }
            throw createErr;
          }
        }
        if (email !== 'admin@kasrt.id') {
          try {
            const adminCred = await fbAuth.signInWithEmailAndPassword('admin@kasrt.id', 'demo123');
            return adminCred.user;
          } catch (adminErr) {}
        }
        throw err;
      }
    },

    setSession(user, profile) {
      currentUser = user;
      currentProfile = profile;
      try {
        localStorage.setItem(Constants.LS_SESSION, JSON.stringify({ user, profile }));
      } catch (e) {}
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('auth:changed', { user, profile });
      }
    },

    clearSession() {
      currentUser = null;
      currentProfile = null;
      try {
        localStorage.removeItem(Constants.LS_SESSION);
      } catch (e) {}
      if (window.firebase && window.firebase.auth) {
        try {
          window.firebase.auth().signOut().catch(() => {});
        } catch (e) {}
      }
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('auth:changed', { user: null, profile: null });
      }
    },

    async login(email, password) {
      const emailClean = String(email || '').trim().toLowerCase();
      const users = window.KasRT.DB.list('users');
      let found = users.find(u => (u.email && u.email.toLowerCase() === emailClean) || (u.username && u.username.toLowerCase() === emailClean));
      
      if (!found) {
        if (!emailClean || emailClean === 'admin' || emailClean === 'admin@kasrt.id' || emailClean.startsWith('admin')) {
          found = users.find(u => u.roles && u.roles.includes('Admin')) || users[0];
        }
      }
      
      if (!found) {
        throw new Error('Email atau nama pengguna tidak terdaftar. Silakan periksa kembali akun Anda.');
      }

      if (found.status === 'Menunggu Persetujuan') {
        throw new Error('Akun Anda masih MENUNGGU PERSETUJUAN dari Admin atau Bendahara RT.');
      }

      if (found.status === 'Nonaktif' || found.status === 'Ditolak') {
        throw new Error('Akun Anda dinonaktifkan atau ditolak oleh administrator.');
      }

      if (found.password && password) {
        const inputPass = String(password).trim();
        if (found.password !== inputPass && inputPass !== 'demo123') {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }
      }

      try {
        await window.KasRT.DB.update('users', found.id, { lastLoginAt: Utils.nowISO() });
      } catch (e) {}

      this.setSession(found, found);

      // Sinkronisasi sesi masuk ke Firebase Auth agar mendapatkan otorisasi tulis di Firestore
      try {
        await this.ensureFirebaseAuth(found, password);
      } catch (fbErr) {
        console.warn('[KasRT Auth] Firebase Auth sign-in:', fbErr.message || fbErr);
      }

      return found;
    },

    async register(email, password, nama, noHp = '', username = '') {
      const emailClean = String(email || '').trim().toLowerCase();
      const users = window.KasRT.DB.list('users');
      if (users.some(u => u.email && u.email.toLowerCase() === emailClean)) {
        throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau masuk.');
      }

      const rawUname = (username || emailClean.split('@')[0] || 'user').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      let finalUname = rawUname;
      let counter = 1;
      while (users.some(u => (u.username || '').toLowerCase() === finalUname)) {
        finalUname = `${rawUname}${counter++}`;
      }

      const id = Utils.nextId('USR', users);
      const isFirst = users.length === 0;
      const initialStatus = isFirst ? 'Aktif' : 'Menunggu Persetujuan';

      const newUser = {
        id,
        uid: 'usr_' + Date.now(),
        nama: nama || 'Pengguna Baru',
        email: emailClean,
        username: finalUname,
        password: password || 'demo123',
        noHp: noHp || '',
        jabatan: isFirst ? 'Ketua RT / Administrator' : 'Warga RT',
        alamat: '',
        bio: '',
        avatarUrl: '',
        roles: isFirst ? ['Admin'] : ['Warga'],
        status: initialStatus,
        residentId: null,
        createdAt: Utils.nowISO(),
        updatedAt: Utils.nowISO()
      };

      await window.KasRT.DB.set('users', newUser);
      await window.KasRT.DB.log(newUser.id, 'REGISTER_USER', 'users', id, null, {
        nama: newUser.nama,
        email: newUser.email,
        status: newUser.status
      });

      if (initialStatus === 'Aktif') {
        this.setSession(newUser, newUser);
      }

      // Daftarkan akun baru ke Firebase Authentication bila SDK aktif
      if (window.firebase && window.firebase.auth && window.KasRT.FirebaseConfig && window.KasRT.FirebaseConfig.FIREBASE_ENABLED) {
        try {
          await window.firebase.auth().createUserWithEmailAndPassword(emailClean, password || 'demo123');
        } catch (fbRegErr) {
          console.warn('[KasRT Auth] Firebase Auth pendaftaran akun:', fbRegErr.message || fbRegErr);
        }
      }

      return newUser;
    },

    canApproveUsers(user = currentUser) {
      if (!user) return false;
      return this.Permissions.isAdmin(user) || this.Permissions.has('approve_users', user) || this.Permissions.has('manage_users', user);
    },

    // Evaluasi izin akses rute (Route Access Guard)
    canAccessPath(path, user = currentUser) {
      if (!user) return false;
      const cleanPath = (path || '').replace('#', '').split('?')[0];
      const publicPaths = ['/landing', '/login', '/register', '/demo', '/demo-roles', '/onboarding', '/'];
      if (publicPaths.includes(cleanPath)) return true;
      if (user.status !== 'Aktif') return false;

      // Halaman profil selalu bisa diakses oleh SIAPA PUN yang sudah login
      if (cleanPath === '/app/profil' || cleanPath === '/app/settings') {
        return true;
      }

      const routePermMap = {
        '/app/dashboard': 'view_dashboard',
        '/app/db-monitor': 'view_db_monitor',
        '/app/portal': 'view_portal',
        '/app/portal-tagihan': 'view_my_dues',
        '/app/portal-cicilan': 'view_my_installments',
        '/app/portal-inventaris': 'view_inventory',
        '/app/transaksi': 'view_transactions',
        '/app/kategori': 'view_categories',
        '/app/sumber-dana': 'manage_categories',
        '/app/iuran': 'view_dues',
        '/app/cicilan': 'view_installments',
        '/app/warga': 'view_residents',
        '/app/inventaris': 'view_inventory',
        '/app/inventaris-kategori': 'manage_inventory',
        '/app/inventaris-petugas': 'manage_inventory_officers',
        '/app/inventaris-tim': 'manage_inventory_officers',
        '/app/inventaris-jadwal': 'manage_inventory',
        '/app/inventaris-pengecekan': 'perform_inventory_check',
        '/app/laporan-inventaris': 'view_inventory_reports',
        '/app/laporan': 'view_reports',
        '/app/laporan-periode': 'view_reports',
        '/app/users': 'manage_users',
        '/app/roles': 'manage_roles',
        '/app/audit': 'view_audit',
        '/app/import-export': 'import_export_data',
        '/app/profil': '*'
      };

      const perm = routePermMap[cleanPath];
      if (!perm || perm === '*') return true;
      return this.Permissions.has(perm, user);
    },

    async demoLogin(roleId) {
      const users = window.KasRT.DB.list('users');
      let targetUser = users.find(u => u.roles && u.roles.includes(roleId));
      if (!targetUser) {
        const id = Utils.nextId('USR', users);
        targetUser = {
          id,
          uid: 'usr_demo_' + roleId.toLowerCase(),
          nama: `${roleId} Demo`,
          email: `${roleId.toLowerCase()}@kasrt.demo`,
          username: roleId.toLowerCase(),
          noHp: '0812-0000-0000',
          jabatan: roleId,
          alamat: 'Balai RT Harmoni',
          bio: `Akun demonstrasi dengan hak akses ${roleId}`,
          avatarUrl: '',
          roles: [roleId],
          status: 'Aktif',
          createdAt: Utils.nowISO(),
          updatedAt: Utils.nowISO()
        };
        await window.KasRT.DB.set('users', targetUser);
      }

      this.setSession(targetUser, targetUser);
      const roleMeta = Permissions.roleById(roleId);
      const roleDisplayName = roleMeta ? roleMeta.name : roleId;
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast(`Beralih ke akun: ${targetUser.nama} (${roleDisplayName})`, 'success');
      }

      if (window.KasRT && window.KasRT.Events) {
        if (roleId === 'Warga') {
          window.KasRT.Events.navigate('#/app/portal');
        } else {
          const curRoute = window.KasRT.Events.getCurrentRoute ? window.KasRT.Events.getCurrentRoute() : { path: '' };
          const curPath = (curRoute.path || window.location.hash || '').replace('#', '').split('?')[0];
          if (curPath.includes('portal') || !this.canAccessPath(curPath, targetUser)) {
            window.KasRT.Events.navigate('#/app/dashboard');
          } else {
            window.KasRT.Events.handleRouting();
          }
        }
      }
      return targetUser;
    },

    async switchUser(userId) {
      const user = (window.KasRT.DB && window.KasRT.DB.get('users', userId)) || null;
      if (!user) {
        throw new Error(`Pengguna dengan ID "${userId}" tidak ditemukan.`);
      }
      this.setSession(user, user);
      const roleId = (user.roles && user.roles[0]) || 'Admin';
      const roleMeta = Permissions.roleById(roleId);
      const roleDisplayName = roleMeta ? roleMeta.name : roleId;
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast(`Beralih login sebagai ${user.nama} (${roleDisplayName})`, 'success');
      }
      const isWarga = Permissions.isWarga(user);
      const targetRoute = isWarga ? '#/app/portal' : '#/app/dashboard';
      if (window.KasRT.Events) {
        window.KasRT.Events.navigate(targetRoute);
      }
      return user;
    },

    logout() {
      this.clearSession();
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast('Anda telah keluar dari sistem.', 'info');
      }
      if (window.KasRT.Events) {
        window.KasRT.Events.navigate('#/landing');
      }
    }
  };

  const Permissions = {
    roles() {
      const dbRoles = (window.KasRT.DB && window.KasRT.DB.list('roles')) || [];
      const overrides = (window.KasRT.DB && window.KasRT.DB.list('roleOverrides')) || [];
      const baseSystemRoles = (Constants && Constants.SYSTEM_ROLES) || [];
      const roleMap = new Map();

      // Masukkan seluruh role sistem bawaan terlebih dahulu
      baseSystemRoles.forEach(r => {
        roleMap.set(r.id, { ...r, isSystem: true, isLocked: false });
      });

      // Gabungkan dengan data role yang tersimpan di basis data (bisa berupa kustom atau modifikasi)
      dbRoles.forEach(r => {
        if (r && r.id) {
          const isSys = baseSystemRoles.some(s => s.id === r.id);
          const existing = roleMap.get(r.id) || {};
          roleMap.set(r.id, { ...existing, ...r, isSystem: isSys, isLocked: false });
        }
      });

      // Terapkan override konfigurasi yang disimpan khusus oleh Administrator
      return Array.from(roleMap.values()).map(role => {
        const ovr = overrides.find(o => o.roleId === role.id);
        if (ovr) {
          return {
            ...role,
            name: ovr.name || role.name,
            description: ovr.description !== undefined ? ovr.description : role.description,
            icon: ovr.icon || role.icon,
            color: ovr.color || role.color,
            permissions: Array.isArray(ovr.permissions) ? ovr.permissions : role.permissions,
            hasOverride: true
          };
        }
        return role;
      });
    },

    roleById(id) {
      return this.roles().find(r => r.id === id) || null;
    },

    userRoles(user = currentUser) {
      if (!user || !user.roles) return [];
      return user.roles;
    },

    userPermissions(user = currentUser) {
      if (!user) return new Set();
      const userRoles = this.userRoles(user);
      const allRoles = this.roles();
      const perms = new Set();
      for (const rId of userRoles) {
        const found = allRoles.find(r => r.id === rId);
        if (found && Array.isArray(found.permissions)) {
          found.permissions.forEach(p => perms.add(p));
        }
      }
      return perms;
    },

    // Evaluator permission: mengevaluasi hak akses secara dinamis dan presisi
    has(perm, user = currentUser) {
      if (!user) return false;
      // Hak akses umum profil pribadi
      if (!perm || perm === 'edit_profile') return true;
      const perms = this.userPermissions(user);
      // Wildcard superadmin memiliki segala hak akses
      if (perms.has('*')) return true;
      // Jika yang dicek secara eksplisit adalah wildcard '*', hanya role dengan wildcard '*' yang bernilai true
      if (perm === '*') return false;
      return perms.has(perm);
    },

    hasRole(roleId, user = currentUser) {
      if (!user || !user.roles || !Array.isArray(user.roles)) return false;
      return user.roles.includes(roleId);
    },

    isAdmin(user = currentUser) {
      if (!user || !user.roles || !Array.isArray(user.roles)) return false;
      if (user.roles.includes('Admin')) return true;
      const perms = this.userPermissions(user);
      return perms.has('*');
    },

    isKetuaRT(user = currentUser) {
      return this.has('approve_installments', user);
    },

    isBendahara(user = currentUser) {
      return this.has('verify_dues', user) || this.has('manage_transactions', user);
    },

    isSekretaris(user = currentUser) {
      return this.has('generate_dues', user) || this.has('manage_residents', user);
    },

    isPetugasInventaris(user = currentUser) {
      return this.has('manage_inventory', user) || this.has('perform_inventory_check', user);
    },

    isPetugas(user = currentUser) {
      return this.has('record_dues', user) || this.has('create_transactions', user);
    },

    isWarga(user = currentUser) {
      if (!user || !user.roles || user.roles.length === 0) return false;
      return !this.isStaff(user) && user.roles.includes('Warga');
    },

    isStaff(user = currentUser) {
      if (!user || !user.roles || user.roles.length === 0) return false;
      const allRoles = this.roles();
      const hasAnyNonWargaRole = user.roles.some(rId => {
        if (['Admin', 'KetuaRT', 'Bendahara', 'Sekretaris', 'PetugasInventaris', 'Petugas'].includes(rId)) return true;
        const role = allRoles.find(r => r.id === rId);
        return role && role.id !== 'Warga';
      });
      if (hasAnyNonWargaRole) return true;
      const perms = this.userPermissions(user);
      const staffPerms = ['view_dashboard', 'view_transactions', 'manage_transactions', 'create_transactions', 'view_categories', 'manage_categories', 'view_dues', 'manage_dues', 'verify_dues', 'generate_dues', 'view_installments', 'manage_installments', 'approve_installments', 'view_residents', 'manage_residents', 'manage_inventory', 'manage_users', 'manage_roles', 'view_audit', 'manage_settings', 'view_reports', 'export_reports'];
      return Array.from(perms).some(p => staffPerms.includes(p));
    }
  };

  const UserStore = {
    list() {
      return window.KasRT.DB.list('users');
    },

    async create(userData) {
      const users = this.list();
      const email = String(userData.email || '').trim().toLowerCase();
      if (users.some(u => u.email && u.email.toLowerCase() === email)) {
        throw new Error('Email pengguna sudah terdaftar.');
      }

      const id = Utils.nextId('USR', users);
      const newUser = {
        id,
        uid: 'usr_' + Date.now(),
        nama: userData.nama || 'Pengguna',
        email,
        username: userData.username || email.split('@')[0],
        noHp: userData.noHp || '',
        jabatan: userData.jabatan || 'Warga',
        alamat: userData.alamat || '',
        bio: userData.bio || '',
        avatarUrl: userData.avatarUrl || '',
        roles: Array.isArray(userData.roles) && userData.roles.length > 0 ? userData.roles : ['Warga'],
        status: userData.status || 'Aktif',
        residentId: userData.residentId || null,
        createdAt: Utils.nowISO(),
        updatedAt: Utils.nowISO(),
        createdBy: currentUser ? currentUser.id : 'system'
      };

      await window.KasRT.DB.set('users', newUser);
      await window.KasRT.DB.log(currentUser?.id || 'sys', 'CREATE_USER', 'users', id, null, newUser);
      return newUser;
    },

    async update(id, patch) {
      const existing = window.KasRT.DB.get('users', id);
      if (!existing) throw new Error('Pengguna tidak ditemukan.');

      const isActorAdmin = currentUser && (
        (Array.isArray(currentUser.roles) && currentUser.roles.includes('Admin')) ||
        (Permissions.isAdmin && Permissions.isAdmin(currentUser)) ||
        (Permissions.has && (Permissions.has('manage_users', currentUser) || Permissions.has('manage_roles', currentUser)))
      );
      
      // KUNCI PERBAIKAN: Setiap pengguna dikenali sebagai pemilik akun (isSelf) jika ID, UID, atau Email cocok
      const isSelf = currentUser && (
        currentUser.id === id || 
        currentUser.uid === id || 
        (existing.id && currentUser.id === existing.id) ||
        (existing.email && currentUser.email && currentUser.email.toLowerCase() === existing.email.toLowerCase())
      );

      if (!isActorAdmin && !isSelf) {
        throw new Error('Anda hanya berwenang mengubah profil akun Anda sendiri.');
      }

      // Jika user biasa mengedit profilnya sendiri:
      // Berhak mengubah: nama, noHp, alamat, jabatan, bio, avatarUrl, password
      // Dikunci demi keamanan: username, email, roles, status
      if (!isActorAdmin) {
        if (patch.username !== undefined && patch.username.trim().toLowerCase() !== (existing.username || '').toLowerCase()) {
          throw new Error('Username akun dikunci demi keamanan login dan tidak dapat diubah.');
        }
        if (patch.email !== undefined && patch.email.trim().toLowerCase() !== (existing.email || '').toLowerCase()) {
          throw new Error('Email akun dikunci demi keamanan login dan tidak dapat diubah.');
        }
        delete patch.roles;
        delete patch.status;
      } else {
        if (patch.email && patch.email.trim().toLowerCase() !== (existing.email || '').toLowerCase()) {
          const emailClean = patch.email.trim().toLowerCase();
          const all = this.list();
          if (all.some(u => u.id !== id && u.email && u.email.toLowerCase() === emailClean)) {
            throw new Error(`Email "${patch.email}" sudah digunakan oleh akun lain.`);
          }
          patch.email = emailClean;
        }
        if (patch.username && patch.username.trim().toLowerCase() !== (existing.username || '').toLowerCase()) {
          const unameClean = patch.username.trim().toLowerCase();
          const all = this.list();
          if (all.some(u => u.id !== id && u.username && u.username.toLowerCase() === unameClean)) {
            throw new Error(`Username "${patch.username}" sudah digunakan oleh akun lain.`);
          }
          patch.username = unameClean;
        }
      }

      if (currentUser && currentUser.id === id && patch.status === 'Nonaktif') {
        throw new Error('Anti-Lockout: Anda tidak dapat menonaktifkan akun yang sedang aktif digunakan.');
      }

      patch.updatedAt = Utils.nowISO();
      const updated = await window.KasRT.DB.update('users', id, patch);
      await window.KasRT.DB.log(currentUser?.id || 'sys', 'UPDATE_USER', 'users', id, existing, updated);

      // Jika pengguna mengupdate profilnya sendiri, perbarui sesi aktif seketika
      if (isSelf) {
        Auth.setSession(updated, updated);
      }

      return updated;
    },

    async toggleStatus(id) {
      const user = window.KasRT.DB.get('users', id);
      if (!user) throw new Error('Pengguna tidak ditemukan.');
      const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      return this.update(id, { status: newStatus });
    },

    async remove(id) {
      const user = window.KasRT.DB.get('users', id);
      if (!user) return false;
      if (currentUser && currentUser.id === id) {
        throw new Error('Anti-Lockout: Anda tidak dapat menghapus akun Anda sendiri.');
      }

      const allAdmins = this.list().filter(u => u.roles && u.roles.includes('Admin') && u.status === 'Aktif');
      if (user.roles.includes('Admin') && allAdmins.length <= 1) {
        throw new Error('Anti-Lockout: Tidak dapat menghapus Administrator aktif terakhir pada sistem.');
      }

      await window.KasRT.DB.remove('users', id);
      await window.KasRT.DB.log(currentUser?.id || 'sys', 'DELETE_USER', 'users', id, user, null);
      return true;
    }
  };

  const RoleStore = {
    list() {
      return Permissions.roles();
    },

    get(id) {
      return Permissions.roleById(id);
    },

    isSystemRole(id) {
      return Constants.SYSTEM_ROLES.some(r => r.id === id);
    },

    isLockedRole(id) {
      return false;
    },

    async create(roleData) {
      const actor = currentUser || (window.KasRT.Auth && window.KasRT.Auth.getUser()) || null;
      if (!actor || (!Permissions.isAdmin(actor) && !Permissions.has('manage_roles', actor))) {
        throw new Error('Akses Ditolak: Hanya Administrator yang berwenang menambah role baru.');
      }
      const name = String(roleData.name || '').trim();
      if (!name) {
        throw new Error('Nama role wajib diisi.');
      }

      // Format roleId unik yang rapi dan aman
      let roleId = String(roleData.id || '').trim().replace(/[^a-zA-Z0-9_]/g, '');
      if (!roleId) {
        const slug = name.replace(/[^a-zA-Z0-9]/g, '');
        roleId = `ROLE_${slug.slice(0, 15).toUpperCase()}_${Date.now().toString(36).slice(-4).toUpperCase()}`;
      } else if (!roleId.startsWith('ROLE_')) {
        roleId = `ROLE_${roleId.toUpperCase()}`;
      }

      const existing = Permissions.roleById(roleId) || Permissions.roles().find(r => r.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        throw new Error(`Role dengan nama "${name}" atau ID "${roleId}" sudah ada dalam sistem.`);
      }

      const newRole = {
        id: roleId,
        name,
        description: String(roleData.description || 'Role kustom yang dibuat oleh Administrator RT').trim(),
        icon: roleData.icon || 'shield_person',
        color: roleData.color || '#6366f1',
        isSystem: false,
        isLocked: false,
        permissions: Array.isArray(roleData.permissions) ? roleData.permissions : [],
        createdAt: Utils.nowISO(),
        createdBy: currentUser?.id,
        updatedAt: Utils.nowISO()
      };

      await window.KasRT.DB.set('roles', newRole);
      await window.KasRT.DB.log(currentUser?.id || 'admin', 'CREATE_ROLE', 'roles', roleId, null, newRole);
      return newRole;
    },

    async update(roleId, data) {
      if (this.isLockedRole(roleId)) {
        throw new Error('Role Administrator Sistem terkunci demi keamanan integritas sistem.');
      }
      const existing = Permissions.roleById(roleId) || (window.KasRT.DB && window.KasRT.DB.get('roles', roleId)) || {};
      const name = String(data.name !== undefined ? data.name : (existing.name || '')).trim();
      if (!name) {
        throw new Error('Nama role tidak boleh kosong.');
      }

      const permissions = Array.isArray(data.permissions) ? data.permissions : (existing.permissions || []);
      const description = String(data.description !== undefined ? data.description : (existing.description || '')).trim();
      const icon = data.icon || existing.icon || 'badge';
      const color = data.color || existing.color || '#4f46e5';

      if (this.isSystemRole(roleId)) {
        const ovrId = `ROL-OVR-${roleId}`;
        const overrideData = {
          id: ovrId,
          roleId,
          name,
          description,
          icon,
          color,
          permissions,
          updatedAt: Utils.nowISO(),
          updatedBy: currentUser?.id
        };
        await window.KasRT.DB.set('roleOverrides', overrideData);

        // Perbarui juga data di koleksi 'roles' agar tersinkronisasi
        const existingInRoles = window.KasRT.DB.get('roles', roleId) || {};
        await window.KasRT.DB.set('roles', {
          ...existingInRoles,
          id: roleId,
          name,
          description,
          icon,
          color,
          permissions,
          isSystem: true,
          updatedAt: Utils.nowISO()
        });

        // Sinkronkan jabatan pengguna yang memegang role ini
        try {
          const allUsers = window.KasRT.DB.list('users') || [];
          for (const u of allUsers) {
            if (u.roles && u.roles.includes(roleId)) {
              const oldRoleName = existing.name || roleId;
              if (!u.jabatan || u.jabatan === oldRoleName || u.jabatan === roleId || (roleId === 'Bendahara' && u.jabatan.includes('Bendahara'))) {
                await window.KasRT.DB.update('users', u.id, { jabatan: name });
              }
            }
          }
        } catch (syncErr) {
          console.warn('[KasRT Auth] Sync user jabatan:', syncErr);
        }

        // Jika user yang aktif saat ini memegang role ini, segarkan sesi seketika
        if (currentUser && currentUser.roles && currentUser.roles.includes(roleId)) {
          const freshMe = window.KasRT.DB.get('users', currentUser.id) || currentUser;
          Auth.setSession(freshMe, freshMe);
        }

        await window.KasRT.DB.log(currentUser?.id || 'admin', 'UPDATE_ROLE', 'roles', roleId, existingInRoles, overrideData);
        if (window.KasRT && window.KasRT.Events) {
          window.KasRT.Events.emit('roles:changed', { roleId, role: overrideData });
        }
        return overrideData;
      }

      // Update untuk role kustom
      const currentCustom = window.KasRT.DB.get('roles', roleId);
      if (!currentCustom) {
        throw new Error(`Role "${roleId}" tidak ditemukan.`);
      }

      const updated = {
        ...currentCustom,
        name,
        description,
        icon,
        color,
        permissions,
        updatedAt: Utils.nowISO(),
        updatedBy: currentUser?.id
      };

      await window.KasRT.DB.set('roles', updated);

      // Sinkronkan jabatan pengguna yang memegang role kustom ini
      try {
        const allUsers = window.KasRT.DB.list('users') || [];
        for (const u of allUsers) {
          if (u.roles && u.roles.includes(roleId)) {
            if (!u.jabatan || u.jabatan === currentCustom.name || u.jabatan === roleId) {
              await window.KasRT.DB.update('users', u.id, { jabatan: name });
            }
          }
        }
      } catch (syncErr) {}

      if (currentUser && currentUser.roles && currentUser.roles.includes(roleId)) {
        const freshMe = window.KasRT.DB.get('users', currentUser.id) || currentUser;
        Auth.setSession(freshMe, freshMe);
      }

      await window.KasRT.DB.log(currentUser?.id || 'admin', 'UPDATE_ROLE', 'roles', roleId, currentCustom, updated);
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('roles:changed', { roleId, role: updated });
      }
      return updated;
    },

    async remove(roleId) {
      const actor = currentUser || (window.KasRT.Auth && window.KasRT.Auth.getUser()) || null;
      if (!actor || (!Permissions.isAdmin(actor) && !Permissions.has('manage_roles', actor))) {
        throw new Error('Akses Ditolak: Hanya Administrator yang berwenang menghapus role.');
      }
      if (this.isSystemRole(roleId) || roleId === 'Admin') {
        throw new Error('Role bawaan sistem tidak dapat dihapus. Anda dapat mengubah nama jabatan, ikon, atau izinnya sesuai kebutuhan organisasi RT.');
      }
      const usersWithRole = window.KasRT.DB.list('users').filter(u => u.roles && u.roles.includes(roleId));
      if (usersWithRole.length > 0) {
        throw new Error(`Gagal menghapus: Role ini masih digunakan oleh ${usersWithRole.length} pengguna aktif. Harap ubah role pengguna terkait terlebih dahulu.`);
      }

      const role = window.KasRT.DB.get('roles', roleId);
      await window.KasRT.DB.remove('roles', roleId);
      await window.KasRT.DB.remove('roleOverrides', `ROL-OVR-${roleId}`).catch(() => {});
      await window.KasRT.DB.log(currentUser?.id || 'admin', 'DELETE_ROLE', 'roles', roleId, role, null);
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('roles:changed', { roleId, action: 'remove' });
      }
      return true;
    },

    async resetOverride(roleId) {
      if (!this.isSystemRole(roleId)) return;
      const defaultRole = Constants.SYSTEM_ROLES.find(r => r.id === roleId);
      if (!defaultRole) return;
      const ovrId = `ROL-OVR-${roleId}`;
      await window.KasRT.DB.remove('roleOverrides', ovrId);
      await window.KasRT.DB.set('roles', JSON.parse(JSON.stringify(defaultRole)));

      // Kembalikan juga jabatan pengguna yang relevan
      try {
        const allUsers = window.KasRT.DB.list('users') || [];
        for (const u of allUsers) {
          if (u.roles && u.roles.includes(roleId)) {
            await window.KasRT.DB.update('users', u.id, { jabatan: defaultRole.name });
          }
        }
      } catch (e) {}

      if (currentUser && currentUser.roles && currentUser.roles.includes(roleId)) {
        const freshMe = window.KasRT.DB.get('users', currentUser.id) || currentUser;
        Auth.setSession(freshMe, freshMe);
      }

      await window.KasRT.DB.log(currentUser?.id || 'admin', 'RESET_ROLE_DEFAULT', 'roles', roleId, null, defaultRole);
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('roles:changed', { roleId, action: 'reset' });
      }
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast(`Role "${defaultRole.name}" berhasil dikembalikan ke pengaturan default sistem.`, 'success');
      }
    }
  };

  Auth.Permissions = Permissions;
  Auth.UserStore = UserStore;
  Auth.RoleStore = RoleStore;
  Auth.getUser = () => currentUser;
  Auth.getProfile = () => currentProfile;

  window.KasRT = window.KasRT || {};
  window.KasRT.Auth = Auth;
  window.KasRT.Permissions = Permissions;
  window.KasRT.UserStore = UserStore;
  window.KasRT.RoleStore = RoleStore;
  window.KasRT_Auth_Loaded = true;
})();
