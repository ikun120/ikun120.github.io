/**
 * KasRT - Report Layout Engine & Token Processor
 * Standar tata letak dokumen resmi RT/RW: KOP surat, nomor, periode, tanda tangan berjenjang,
 * audit watermark, dan token interpolation 28+ variabel
 */
(function() {
  'use strict';
  if (window.KasRT_Reports_Engine_Loaded) return;

  const LS_LAYOUT_KEY = 'kasrt_report_layout_v7';
  const DEFAULT_LAYOUT = {
    version: 7,
    kop: {
      show: true,
      icon: 'apartment',
      badgeText: 'RT 01 / RW 01',
      title: 'Kumpulan Warga',
      subtitle: 'Komunitas Warga Masyarakat RT 01',
      alamat: 'Dsn. Wayuhrejo, Pasuruhan, Mertoyudan, Magelang',
      showKontak: true,
      telp: '0812-3456-7890',
      email: 'kasrt01@gmail.com',
      showBorder: true,
      borderThickness: 2.5,
      borderThickness2: 1,
      align: 'left',
      uppercase: true
    },
    title: {
      show: true,
      showNomor: true,
      showPeriode: true,
      showSubtitle: true,
      nomorFormat: '{dd}{mm}/{prefix}-KAS/{badge}/{bulanAngka}/{tahun}',
      periodeFormat: '01 {bulan} {tahun} s.d. {hariTerakhir} {bulan} {tahun}',
      underline: true,
      align: 'center'
    },
    signature: {
      show: true,
      layout: '2-col',
      kota: 'Magelang',
      tanggalMode: 'today',
      tanggalCustom: '',
      showTanggal: true,
      kalimatTanggal: 'Ditetapkan di {kota}, pada tanggal {tanggal}',
      leftHeader: 'Mengetahui & Menyetujui,',
      leftJabatan: 'Bendahara RT',
      leftNama: 'Pak Ikun',
      leftBadge: 'TERCATAT & AUDITED',
      leftBadgeSub: 'Arsip Keuangan RT',
      showLeftBadge: true,
      middleHeader: 'Mengetahui,',
      middleJabatan: 'Sekretaris RT',
      middleNama: 'Sekretaris RT',
      middleBadge: 'TERVERIFIKASI',
      middleBadgeSub: 'Administrasi',
      showMiddleBadge: false,
      rightHeader: 'Mengetahui & Mengesahkan,',
      rightJabatan: 'Ketua RT',
      rightNama: 'Pak Kamid',
      rightBadge: 'TERVALIDASI RESMI',
      rightBadgeSub: 'Surat Sah RT/RW',
      showRightBadge: true,
      emptyHeight: 55,
      showItalicNama: true,
      showNamaUnderline: true
    },
    audit: {
      show: true,
      showSha: true,
      showTimestamp: true,
      showStatus: true,
      text: 'Dokumen ini diterbitkan secara otomatis oleh Sistem KasRT dan sah tanpa stempel basah tambahan.',
      statusText: 'Dokumen Terbuka & Sah untuk Seluruh Warga RT'
    },
    watermark: {
      show: true,
      text: 'KAS RT 01',
      opacity: 0.025
    }
  };

  const PRESETS = {
    default: DEFAULT_LAYOUT,
    formal: {
      ...DEFAULT_LAYOUT,
      kop: { ...DEFAULT_LAYOUT.kop, align: 'center', borderThickness: 3 },
      title: { ...DEFAULT_LAYOUT.title, underline: true, align: 'center' },
      signature: { ...DEFAULT_LAYOUT.signature, layout: '2-col', showLeftBadge: true, showRightBadge: true }
    },
    simple: {
      ...DEFAULT_LAYOUT,
      kop: { ...DEFAULT_LAYOUT.kop, showBorder: true, borderThickness: 1.5, showKontak: false },
      signature: { ...DEFAULT_LAYOUT.signature, showLeftBadge: false, showRightBadge: false }
    },
    minimal: {
      ...DEFAULT_LAYOUT,
      kop: { ...DEFAULT_LAYOUT.kop, show: false },
      audit: { ...DEFAULT_LAYOUT.audit, show: false }
    }
  };

  const ReportEngine = {
    get() {
      const saved = localStorage.getItem(LS_LAYOUT_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_LAYOUT, ...parsed };
        } catch (e) {}
      }
      return JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
    },

    save(layout) {
      localStorage.setItem(LS_LAYOUT_KEY, JSON.stringify(layout));
      if (window.KasRT && window.KasRT.Events) {
        window.KasRT.Events.emit('report:layout:changed', layout);
      }
      return layout;
    },

    reset() {
      localStorage.removeItem(LS_LAYOUT_KEY);
      return this.get();
    },

    applyPreset(name) {
      const preset = PRESETS[name] || PRESETS.default;
      return this.save(JSON.parse(JSON.stringify(preset)));
    },

    contextFor(meta = {}) {
      const db = window.KasRT && window.KasRT.DB;
      const settings = (db && db.get('settings', 'global')) || {};
      const now = new Date();
      const d = meta.date ? new Date(meta.date) : now;
      const day = d.getDate();
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const lastDayOfMonth = new Date(year, monthIdx + 1, 0).getDate();
      const Utils = window.KasRT.Utils || {};
      const monthName = Utils.MONTHS_ID ? Utils.MONTHS_ID[monthIdx] : 'Oktober';
      const monthShort = Utils.MONTHS_SHORT_ID ? Utils.MONTHS_SHORT_ID[monthIdx] : 'Okt';
      const monthRoman = Utils.ROMAN_MONTHS ? Utils.ROMAN_MONTHS[monthIdx] : 'X';
      const pad = (n) => String(n).padStart(2, '0');

      return {
        namaOrganisasi: settings.namaOrganisasi || 'RT 01 / RW 01',
        alamat: settings.alamat || 'Jl. Merpati Blok B No. 12',
        ketua: settings.namaKetua || 'Bambang Sutrisno, S.T.',
        bendahara: settings.namaBendahara || 'Siti Aminah, S.E.',
        sekretaris: settings.namaSekretaris || 'Hendra Gunawan',
        kota: settings.kota || 'Magelang',
        tanggal: `${day} ${monthName} ${year}`,
        tanggalNum: `${year}-${pad(monthIdx + 1)}-${pad(day)}`,
        tanggalHariIni: `${now.getDate()} ${Utils.MONTHS_ID ? Utils.MONTHS_ID[now.getMonth()] : 'Oktober'} ${now.getFullYear()}`,
        ddHariIni: pad(now.getDate()),
        mmHariIni: pad(now.getMonth() + 1),
        bulan: monthName,
        bulanShort: monthShort,
        bulanAngka: pad(monthIdx + 1),
        bulanRomawi: monthRoman,
        tahun: String(year),
        hariTerakhir: String(lastDayOfMonth),
        dd: pad(day),
        mm: pad(monthIdx + 1),
        kode: meta.code || 'KAS-01',
        kodeJudul: (meta.code || 'KAS-01').replace('-', '/'),
        prefix: (meta.code || 'KAS').split('-')[0] || 'KAS',
        nomor: meta.nomor || `${pad(day)}${pad(monthIdx + 1)}/KAS/${year}`,
        badge: (settings.namaOrganisasi || 'RT01RW01').replace(/[^a-zA-Z0-9]/g, ''),
        badgeText: meta.badgeText || 'RT 01 / RW 01',
        periodeShort: meta.periodeShort || `${monthShort} ${year}`,
        periodeText: meta.periodeText || `01 ${monthName} ${year} s.d. ${lastDayOfMonth} ${monthName} ${year}`
      };
    },

    renderTokens(templateStr, context) {
      if (!templateStr) return '';
      return String(templateStr).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, tokenName) => {
        return context[tokenName] !== undefined ? context[tokenName] : match;
      });
    },

    buildDocumentShell(bodyHtml, meta = {}) {
      const layout = this.get();
      const ctx = this.contextFor(meta);

      const kopHtml = layout.kop.show ? `
        <div class="report-kop pb-3 mb-3 border-b-[3px] border-double border-slate-900 flex items-start gap-3.5 text-${layout.kop.align || 'left'}">
          <div class="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm print:bg-slate-900 print:text-white">
            <span class="material-symbols-outlined text-2xl">${layout.kop.icon || 'apartment'}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-0.5">
              <h1 class="text-sm sm:text-base font-black tracking-wide uppercase leading-tight font-display text-slate-900">${this.renderTokens(layout.kop.title, ctx)}</h1>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">${layout.kop.badgeText}</span>
            </div>
            <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wide leading-tight">${this.renderTokens(layout.kop.subtitle, ctx)}</div>
            <div class="text-[10px] text-slate-600 mt-0.5 leading-snug">${this.renderTokens(layout.kop.alamat, ctx)}</div>
            ${layout.kop.showKontak ? `
              <div class="text-[10px] text-slate-500 mt-0.5 font-mono">Telp: ${layout.kop.telp} | Email: ${layout.kop.email}</div>
            ` : ''}
          </div>
        </div>
      ` : '';

      const titleHtml = layout.title.show ? `
        <div class="report-title-block my-3 text-${layout.title.align || 'center'}">
          <h2 class="text-base sm:text-lg font-black tracking-wide uppercase font-display text-slate-900 ${layout.title.underline ? 'underline decoration-2 underline-offset-4' : ''}">
            ${meta.title || 'LAPORAN KAS RT'}
          </h2>
          ${layout.title.showNomor ? `
            <div class="text-[11px] font-mono text-slate-600 mt-0.5">Nomor: ${this.renderTokens(layout.title.nomorFormat, ctx)}</div>
          ` : ''}
          ${layout.title.showPeriode ? `
            <div class="text-[11px] font-semibold text-primary mt-0.5">Periode: ${this.renderTokens(layout.title.periodeFormat, ctx)}</div>
          ` : ''}
        </div>
      ` : '';

      const sig = layout.signature;
      const signatureHtml = sig.show ? `
        <div class="report-signatures mt-6 pt-4 border-t border-slate-300 break-inside-avoid">
          <div class="text-right text-[11px] text-slate-600 mb-3 font-medium">
            ${this.renderTokens(sig.kalimatTanggal, ctx)}
          </div>
          <div class="grid grid-cols-2 gap-3 sm:gap-6 text-center text-xs">
            <div class="flex flex-col items-center">
              <span class="text-slate-500 font-medium text-[11px]">${sig.leftHeader}</span>
              <span class="font-bold text-slate-900 text-xs mb-1">${sig.leftJabatan}</span>
              <div class="h-12 flex items-center justify-center my-1">
                ${sig.showLeftBadge ? `<span class="px-2 py-0.5 rounded border border-emerald-400 text-emerald-600 text-[9px] font-bold tracking-wider uppercase bg-emerald-50">${sig.leftBadge}</span>` : ''}
              </div>
              <span class="font-bold text-slate-900 text-xs ${sig.showNamaUnderline ? 'underline' : ''}">(${sig.leftNama})</span>
              <span class="text-[10px] text-slate-500 mt-0.5">${sig.leftBadgeSub}</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-slate-500 font-medium text-[11px]">${sig.rightHeader}</span>
              <span class="font-bold text-slate-900 text-xs mb-1">${sig.rightJabatan}</span>
              <div class="h-12 flex items-center justify-center my-1">
                ${sig.showRightBadge ? `<span class="px-2 py-0.5 rounded border border-indigo-400 text-indigo-600 text-[9px] font-bold tracking-wider uppercase bg-indigo-50">${sig.rightBadge}</span>` : ''}
              </div>
              <span class="font-bold text-slate-900 text-xs ${sig.showNamaUnderline ? 'underline' : ''}">(${sig.rightNama})</span>
              <span class="text-[10px] text-slate-500 mt-0.5">${sig.rightBadgeSub}</span>
            </div>
          </div>
        </div>
      ` : '';

      const audit = layout.audit;
      const auditHtml = audit.show ? `
        <div class="report-audit mt-6 pt-2.5 border-t border-slate-300 text-[9px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1.5 break-inside-avoid">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-emerald-600">verified</span>
            <span>${audit.text}</span>
          </div>
          <div class="flex items-center gap-2.5 font-mono">
            <span>Status: <strong class="text-emerald-700">${audit.statusText}</strong></span>
            ${audit.showSha ? `<span>SHA-256: <strong class="report-sha-placeholder">0000000000000000000000000000000000000000000000000000000000000000</strong></span>` : ''}
          </div>
        </div>
      ` : '';

      return `
        <div class="a4-document-page bg-white text-slate-900 p-4 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-200 relative overflow-hidden print:p-0 print:border-none print:shadow-none print:rounded-none">
          ${layout.watermark.show ? `
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <span class="text-6xl sm:text-7xl font-black text-slate-900 tracking-widest uppercase transform -rotate-45" style="opacity: ${layout.watermark.opacity || 0.02}">
                ${layout.watermark.text}
              </span>
            </div>
          ` : ''}
          <div class="relative z-10">
            ${kopHtml}
            ${titleHtml}
            <div class="report-body my-4">
              ${bodyHtml}
            </div>
            ${signatureHtml}
            ${auditHtml}
          </div>
        </div>
      `;
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Reports = window.KasRT.Reports || {};
  window.KasRT.Reports.Engine = ReportEngine;
  window.KasRT_Reports_Engine_Loaded = true;
})();
