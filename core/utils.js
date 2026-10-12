/**
 * KasRT - Core Utilities
 * Formatting rupiah, tanggal Indonesia, SHA-256 nyata, sequential ID, debounce, byte formatting
 */
(function() {
  'use strict';
  if (window.KasRT_Utils_Loaded) return;

  const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const MONTHS_SHORT_ID = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const ROMAN_MONTHS = [
    'I', 'II', 'III', 'IV', 'V', 'VI',
    'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
  ];

  function formatRp(n) {
    const num = parseNumber(n);
    const isNegative = num < 0;
    const abs = Math.abs(Math.round(num));
    const parts = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${isNegative ? '-' : ''}Rp ${parts}`;
  }

  function formatRpNumber(n) {
    if (n === null || n === undefined || n === '') return '';
    const num = parseNumber(n);
    const isNegative = num < 0;
    const abs = Math.abs(Math.round(num));
    const parts = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${isNegative ? '-' : ''}${parts}`;
  }

  function formatRpShort(n) {
    const num = Number(n) || 0;
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (abs >= 1_000_000_000) {
      return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (abs >= 1_000_000) {
      return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`;
    }
    if (abs >= 1_000) {
      return `${sign}Rp ${(abs / 1_000).toFixed(0)}rb`;
    }
    return `${sign}Rp ${abs}`;
  }

  function formatDate(iso) {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      const day = d.getDate();
      const month = MONTHS_SHORT_ID[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return String(iso);
    }
  }

  function formatDateLong(iso) {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      const day = d.getDate();
      const month = MONTHS_ID[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return String(iso);
    }
  }

  function formatDateTime(iso) {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      const day = d.getDate();
      const month = MONTHS_SHORT_ID[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${mins}`;
    } catch {
      return String(iso);
    }
  }

  function relTime(iso) {
    if (!iso) return '-';
    try {
      const past = new Date(iso).getTime();
      const now = Date.now();
      const diffSec = Math.floor((now - past) / 1000);
      if (diffSec < 45) return 'baru saja';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} hari lalu`;
      return formatDate(iso);
    } catch {
      return String(iso);
    }
  }

  function escape(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initials(name) {
    if (!name) return 'RT';
    const clean = String(name).trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function today() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function nextId(prefix, arr = [], key = 'id') {
    const safePrefix = prefix ? `${prefix}-` : 'DOC-';
    let maxNum = 0;
    for (const item of arr) {
      if (!item || !item[key]) continue;
      const str = String(item[key]);
      if (str.startsWith(safePrefix)) {
        const sub = str.slice(safePrefix.length);
        const num = parseInt(sub, 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    }
    const nextNum = maxNum + 1;
    const pad = prefix.length <= 4 ? 4 : 3;
    return `${safePrefix}${String(nextNum).padStart(pad, '0')}`;
  }

  function parseNumber(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const str = String(val).trim();
    if (!str) return 0;
    const isNegative = str.startsWith('-');
    let clean = str;
    if (clean.includes(',')) {
      const parts = clean.split(',');
      const intPart = parts[0].replace(/[^\d]/g, '');
      const decPart = parts[1].replace(/[^\d]/g, '');
      clean = intPart + (decPart ? '.' + decPart : '');
    } else if (/\.\d{3}(\.|$)/.test(clean)) {
      clean = clean.replace(/[^\d]/g, '');
    } else if (clean.includes('.')) {
      const dotParts = clean.split('.');
      if (dotParts.length > 2 || (dotParts.length === 2 && dotParts[1].length === 3)) {
        clean = clean.replace(/[^\d]/g, '');
      } else {
        clean = clean.replace(/[^\d.]/g, '');
      }
    } else {
      clean = clean.replace(/[^\d]/g, '');
    }
    const num = parseFloat(clean);
    if (isNaN(num)) return 0;
    return isNegative ? -num : num;
  }

  function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function debounce(fn, wait = 100) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function waitFor(predicate, timeout = 10000, label = 'resource') {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        try {
          if (predicate()) {
            return resolve(true);
          }
        } catch (e) {
          // ignore
        }
        if (Date.now() - start > timeout) {
          console.warn(`[KasRT] waitFor timed out waiting for ${label}`);
          return resolve(false);
        }
        setTimeout(check, 50);
      };
      check();
    });
  }

  async function computeContentSha(input) {
    try {
      const text = typeof input === 'string' ? input : JSON.stringify(input || {});
      if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hex;
      }
    } catch (e) {
      console.warn('[KasRT] SubtleCrypto unavailable or failed, using fallback:', e);
    }
    const text = typeof input === 'string' ? input : JSON.stringify(input || {});
    let h1 = 0x811c9dc5;
    let h2 = 0x84222325;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      h1 ^= c;
      h1 = Math.imul(h1, 0x01000193);
      h2 ^= c;
      h2 = Math.imul(h2, 0x01000193);
    }
    const hexPart = (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
    return ('FNV64-' + hexPart.repeat(4)).slice(0, 64);
  }

  const Utils = {
    MONTHS_ID,
    MONTHS_SHORT_ID,
    ROMAN_MONTHS,
    formatRp,
    formatRpNumber,
    formatRpShort,
    formatDate,
    formatDateLong,
    formatDateTime,
    relTime,
    escape,
    initials,
    today,
    nowISO,
    nextId,
    parseNumber,
    formatBytes,
    debounce,
    waitFor,
    computeContentSha
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Utils = Utils;
  window.computeContentSha = computeContentSha;
  window.KasRT_Utils_Loaded = true;
})();
