/**
 * KasRT - Core Events & Router
 * Event bus publish/subscribe dan Hash Router
 */
(function() {
  'use strict';
  if (window.KasRT_Events_Loaded) return;

  const listeners = new Map();
  const routes = [];
  let currentRoute = { hash: '', path: '', params: {}, query: {} };

  function on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(callback);
    return () => off(event, callback);
  }

  function off(event, callback) {
    if (listeners.has(event)) {
      listeners.get(event).delete(callback);
    }
  }

  function emit(event, data) {
    if (listeners.has(event)) {
      listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[KasRT Events] Error handling event "${event}":`, err);
        }
      });
    }
  }

  function parseHash(hashString) {
    const raw = (hashString || '').replace(/^#\/?/, '');
    const [pathPart, queryPart] = raw.split('?');
    const path = '/' + (pathPart || '').replace(/^\/+/, '');
    const query = {};
    if (queryPart) {
      const sp = new URLSearchParams(queryPart);
      sp.forEach((val, key) => {
        query[key] = val;
      });
    }
    return { path, query, raw: hashString || '#/' };
  }

  function addRoute(pattern, handler, meta = {}) {
    const paramNames = [];
    const regexPattern = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp(`^${regexPattern}$`);
    routes.push({
      pattern,
      regex,
      paramNames,
      handler,
      meta
    });
  }

  function matchRoute(path) {
    for (const r of routes) {
      const match = path.match(r.regex);
      if (match) {
        const params = {};
        r.paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });
        return { route: r, params };
      }
    }
    return null;
  }

  let isRouting = false;
  async function handleRouting() {
    if (isRouting) return;
    isRouting = true;
    try {
      const hash = window.location.hash || '#/landing';
      const parsed = parseHash(hash);
      const match = matchRoute(parsed.path);
      currentRoute = {
        hash,
        path: parsed.path,
        query: parsed.query,
        params: match ? match.params : {},
        meta: match ? match.route.meta : {}
      };
      emit('route:changing', currentRoute);

      const auth = window.KasRT && window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      // Proteksi rute internal: Jika pengguna belum masuk dan mencoba membuka /app/*, arahkan ke landing
      if (parsed.path.startsWith('/app') && !currentUser) {
        window.location.hash = '#/landing';
        return;
      }

      if (match && match.route.meta && match.route.meta.perm) {
        const requiredPerm = match.route.meta.perm;
        const hasAccess = (auth && auth.Permissions) ? auth.Permissions.has(requiredPerm, currentUser) : true;
        if (!hasAccess) {
          console.warn(`[KasRT Router] Akses ditolak ke "${parsed.path}". Izin dibutuhkan: "${requiredPerm}".`);
          if (!currentUser) {
            window.location.hash = '#/landing';
            return;
          }
          const Shell = window.KasRT && window.KasRT.Shell;
          if (Shell && Shell.renderForbidden) {
            Shell.renderForbidden(requiredPerm, parsed.path);
            emit('route:changed', currentRoute);
            return;
          }
        }
      }

      if (match && typeof match.route.handler === 'function') {
        try {
          await match.route.handler(currentRoute);
        } catch (err) {
          console.error('[KasRT Router] Error rendering route:', err);
          if (window.KasRT && window.KasRT.UI && window.KasRT.UI.showToast) {
            window.KasRT.UI.showToast('Gagal memuat halaman: ' + err.message, 'error');
          }
        }
      } else {
        emit('route:notfound', currentRoute);
      }
      emit('route:changed', currentRoute);
    } finally {
      isRouting = false;
    }
  }

  on('auth:changed', () => {
    const curHash = window.location.hash || '';
    if (curHash.startsWith('#/login') || curHash.startsWith('#/register')) {
      return;
    }
    handleRouting();
  });

  on('roles:changed', () => {
    handleRouting();
  });

  function navigate(hash) {
    const formatted = hash.startsWith('#') ? hash : `#${hash}`;
    if (window.location.hash !== formatted) {
      window.location.hash = formatted;
    }
    handleRouting();
  }

  function initRouter() {
    window.addEventListener('hashchange', handleRouting);
    const auth = window.KasRT && window.KasRT.Auth;
    const user = auth ? auth.user : null;
    const curHash = window.location.hash || '';
    if (!curHash || curHash === '#' || curHash === '#/' || (!user && curHash.startsWith('#/app'))) {
      if (user && auth && auth.Permissions && auth.Permissions.isWarga(user)) {
        window.location.hash = '#/app/portal';
      } else if (user) {
        window.location.hash = '#/app/dashboard';
      } else {
        window.location.hash = '#/landing';
      }
    } else {
      handleRouting();
    }
  }

  function getCurrentRoute() {
    return currentRoute;
  }

  const Events = {
    on,
    off,
    emit,
    addRoute,
    navigate,
    initRouter,
    handleRouting,
    getCurrentRoute,
    parseHash
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Events = Events;
  window.KasRT_Events_Loaded = true;
})();
