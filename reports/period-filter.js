/**
 * KasRT - Report Period Filter Engine
 * Toolbar pemilihan rentang tanggal dinamis dan penyelarasan token periode pada dokumen
 */
(function() {
  'use strict';
  if (window.KasRT_Reports_PeriodFilter_Loaded) return;

  const Utils = window.KasRT.Utils;

  const PeriodFilter = {
    currentFilters: {},

    getFilter(reportCode) {
      return this.currentFilters[reportCode] || {
        type: 'month',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        startDate: '',
        endDate: ''
      };
    },

    setFilter(reportCode, filterObj) {
      this.currentFilters[reportCode] = { ...this.getFilter(reportCode), ...filterObj };
      if (window.KasRT.Events) {
        window.KasRT.Events.emit('report:filter:changed', { reportCode, filter: this.currentFilters[reportCode] });
      }
      return this.currentFilters[reportCode];
    },

    getPeriodMeta(reportCode) {
      const f = this.getFilter(reportCode);
      const now = new Date();
      const currentYear = f.year || now.getFullYear();
      const currentMonth = f.month || (now.getMonth() + 1);
      const mIdx = Math.max(0, Math.min(11, currentMonth - 1));
      const monthsList = (Utils && Utils.MONTHS_ID) || ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const monthsShortList = (Utils && Utils.MONTHS_SHORT_ID) || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const monthName = monthsList[mIdx] || 'Oktober';
      const monthShort = monthsShortList[mIdx] || 'Okt';
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();

      if (f.type === 'month') {
        return {
          periodeShort: `${monthShort} ${currentYear}`,
          periodeText: `01 ${monthName} ${currentYear} s.d. ${lastDay} ${monthName} ${currentYear}`,
          date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
        };
      }
      if (f.type === 'year') {
        return {
          periodeShort: `Tahun ${currentYear}`,
          periodeText: `01 Januari ${currentYear} s.d. 31 Desember ${currentYear}`,
          date: `${currentYear}-01-01`
        };
      }
      if (f.type === 'custom' && f.startDate && f.endDate) {
        return {
          periodeShort: `${Utils.formatDate(f.startDate)} - ${Utils.formatDate(f.endDate)}`,
          periodeText: `${Utils.formatDate(f.startDate)} s.d. ${Utils.formatDate(f.endDate)}`,
          date: f.startDate
        };
      }
      return {
        periodeShort: 'Seluruh Periode',
        periodeText: `Tahun Kalender ${currentYear}`,
        date: Utils.today()
      };
    },

    renderParamsHtml(reportCode) {
      const f = this.getFilter(reportCode);
      const now = new Date();
      const currentYear = now.getFullYear();

      if (f.type === 'month') {
        return `
          <select id="report-filter-month" onchange="KasRT.Reports.PeriodFilter.handleMonthChange('${reportCode}', this.value)" class="text-xs font-semibold bg-surface-lowest border border-outline-variant rounded-xl px-2.5 py-1.5 text-on-surface">
            ${Utils.MONTHS_ID.map((name, i) => `<option value="${i + 1}" ${f.month === i + 1 ? 'selected' : ''}>${name}</option>`).join('')}
          </select>
          <select id="report-filter-year" onchange="KasRT.Reports.PeriodFilter.handleYearChange('${reportCode}', this.value)" class="text-xs font-semibold bg-surface-lowest border border-outline-variant rounded-xl px-2.5 py-1.5 text-on-surface">
            <option value="${currentYear - 1}" ${f.year === currentYear - 1 ? 'selected' : ''}>${currentYear - 1}</option>
            <option value="${currentYear}" ${f.year === currentYear ? 'selected' : ''}>${currentYear}</option>
            <option value="${currentYear + 1}" ${f.year === currentYear + 1 ? 'selected' : ''}>${currentYear + 1}</option>
          </select>
        `;
      }
      if (f.type === 'year') {
        return `
          <select id="report-filter-year" onchange="KasRT.Reports.PeriodFilter.handleYearChange('${reportCode}', this.value)" class="text-xs font-semibold bg-surface-lowest border border-outline-variant rounded-xl px-2.5 py-1.5 text-on-surface">
            <option value="${currentYear - 2}" ${f.year === currentYear - 2 ? 'selected' : ''}>${currentYear - 2}</option>
            <option value="${currentYear - 1}" ${f.year === currentYear - 1 ? 'selected' : ''}>${currentYear - 1}</option>
            <option value="${currentYear}" ${f.year === currentYear ? 'selected' : ''}>${currentYear}</option>
            <option value="${currentYear + 1}" ${f.year === currentYear + 1 ? 'selected' : ''}>${currentYear + 1}</option>
          </select>
        `;
      }
      if (f.type === 'custom') {
        return `
          <input type="date" id="report-filter-start" value="${f.startDate || Utils.today()}" onchange="KasRT.Reports.PeriodFilter.handleCustomDate('${reportCode}')" class="text-xs bg-surface-lowest border border-outline-variant rounded-xl px-2 py-1 text-on-surface" />
          <span class="text-xs text-slate-400">s.d.</span>
          <input type="date" id="report-filter-end" value="${f.endDate || Utils.today()}" onchange="KasRT.Reports.PeriodFilter.handleCustomDate('${reportCode}')" class="text-xs bg-surface-lowest border border-outline-variant rounded-xl px-2 py-1 text-on-surface" />
        `;
      }
      return `<span class="text-xs text-slate-500 italic">Menampilkan seluruh data kas tanpa batasan waktu</span>`;
    },

    renderToolbarHtml(reportCode) {
      const f = this.getFilter(reportCode);
      return `
        <div class="report-filter-toolbar p-2.5 sm:p-3 rounded-2xl bg-surface-container/60 border border-outline-variant flex flex-wrap items-center justify-between gap-2.5 my-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">filter_alt</span>
            <span class="text-xs font-bold text-on-surface">Filter Periode:</span>
            <select id="report-filter-type" onchange="KasRT.Reports.PeriodFilter.handleTypeChange('${reportCode}', this.value)" class="text-xs font-semibold bg-surface-lowest border border-outline-variant rounded-xl px-2.5 py-1.5 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="month" ${f.type === 'month' ? 'selected' : ''}>Bulanan</option>
              <option value="year" ${f.type === 'year' ? 'selected' : ''}>Tahunan</option>
              <option value="custom" ${f.type === 'custom' ? 'selected' : ''}>Rentang Bebas</option>
              <option value="all" ${f.type === 'all' ? 'selected' : ''}>Semua Periode</option>
            </select>
          </div>
          <div id="report-filter-params" class="flex items-center gap-2 flex-wrap">
            ${this.renderParamsHtml(reportCode)}
          </div>
        </div>
      `;
    },

    handleTypeChange(code, type) {
      this.setFilter(code, { type });
      const paramsEl = document.getElementById('report-filter-params');
      if (paramsEl) {
        paramsEl.innerHTML = this.renderParamsHtml(code);
      }
      window.KasRT.Reports.Export?.refreshActivePreview?.(code);
    },

    handleMonthChange(code, month) {
      this.setFilter(code, { month: parseInt(month, 10) });
      window.KasRT.Reports.Export?.refreshActivePreview?.(code);
    },

    handleYearChange(code, year) {
      this.setFilter(code, { year: parseInt(year, 10) });
      window.KasRT.Reports.Export?.refreshActivePreview?.(code);
    },

    handleCustomDate(code) {
      const s = document.getElementById('report-filter-start')?.value;
      const e = document.getElementById('report-filter-end')?.value;
      this.setFilter(code, { startDate: s, endDate: e });
      window.KasRT.Reports.Export?.refreshActivePreview?.(code);
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Reports = window.KasRT.Reports || {};
  window.KasRT.Reports.PeriodFilter = PeriodFilter;
  window.KasRT_Reports_PeriodFilter_Loaded = true;
})();
