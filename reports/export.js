/**
 * KasRT - Report Export Engine & Live Preview
 * Pratinjau interaktif, kalkulasi SHA-256 nyata, dan ekspor profesional ke PDF, Excel (.xls), dan Word (.doc)
 */
(function() {
  'use strict';
  if (window.KasRT_Reports_Export_Loaded) return;

  const Utils = window.KasRT.Utils;

  const REPORT_STANDALONE_CSS = `
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      line-height: 1.4;
    }
    .font-display {
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
    }
    .a4-document-page {
      width: 100%;
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      color: #0f172a;
      padding: 24px 32px;
      box-sizing: border-box;
    }
    .report-kop {
      border-bottom: 3px double #0f172a;
      padding-bottom: 12px;
      margin-bottom: 14px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      text-align: left;
    }
    .report-kop .w-12 {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background-color: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .report-kop .material-symbols-outlined {
      font-size: 26px;
    }
    .report-kop h1 {
      font-size: 15px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.2;
      color: #0f172a;
      margin: 0;
      display: inline-block;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .report-kop .badge-rt {
      display: inline-block;
      margin-left: 8px;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      background-color: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }
    .report-kop .subtitle-rt {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #334155;
      margin-top: 3px;
      letter-spacing: 0.3px;
    }
    .report-kop .alamat-rt {
      font-size: 10px;
      color: #475569;
      margin-top: 2px;
      line-height: 1.3;
    }
    .report-kop .kontak-rt {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 2px;
      font-family: monospace;
    }
    .report-title-block {
      text-align: center;
      margin: 14px 0 16px 0;
    }
    .report-title-block h2 {
      font-size: 17px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin: 0;
      text-decoration: underline;
      text-underline-offset: 4px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .report-title-block .nomor-lap {
      font-size: 11px;
      color: #475569;
      margin-top: 3px;
      font-family: monospace;
    }
    .report-title-block .periode-lap {
      font-size: 11px;
      font-weight: 700;
      color: #4f46e5;
      margin-top: 2px;
    }
    .grid {
      display: grid;
      gap: 10px;
      margin: 12px 0;
    }
    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    @media (min-width: 640px) {
      .sm\\:grid-cols-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
    .grid > div {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }
    .grid > div > span:first-child {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
      display: block;
    }
    .grid > div > div {
      font-size: 13.5px;
      font-weight: 900;
      color: #0f172a;
      margin: 3px 0;
      font-family: monospace;
    }
    .grid > div > span:last-child {
      font-size: 9px;
      color: #94a3b8;
      font-weight: 500;
      display: block;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin: 8px 0 16px 0;
    }
    thead {
      display: table-header-group;
      background-color: #f1f5f9;
    }
    th {
      border: 1px solid #cbd5e1;
      padding: 7px 9px;
      text-align: left;
      font-weight: 800;
      color: #1e293b;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      border: 1px solid #e2e8f0;
      padding: 6px 9px;
      text-align: left;
      color: #0f172a;
      vertical-align: middle;
    }
    tbody tr:nth-child(even) {
      background-color: #fcfdfe;
    }
    tfoot {
      display: table-footer-group;
      background-color: #f8fafc;
      font-weight: 800;
    }
    tfoot td {
      border-top: 2px solid #0f172a !important;
      border-bottom: 2px solid #0f172a !important;
      border-left: 1px solid #cbd5e1;
      border-right: 1px solid #cbd5e1;
      padding: 7px 9px;
      font-weight: 800;
      font-size: 11px;
    }
    .text-right { text-align: right !important; }
    .text-center { text-align: center !important; }
    .text-left { text-align: left !important; }
    .text-emerald-600, .text-emerald-400 { color: #059669 !important; font-weight: 700; }
    .text-rose-600, .text-rose-400 { color: #e11d48 !important; font-weight: 700; }
    .text-primary { color: #4f46e5 !important; }
    .report-signatures {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #cbd5e1;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .report-signatures .tgl-penetapan {
      text-align: right;
      font-size: 10.5px;
      color: #475569;
      margin-bottom: 12px;
      font-weight: 500;
    }
    .report-audit {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
      font-size: 9px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: monospace;
      page-break-inside: avoid;
      break-inside: avoid;
    }
  `;

  const ExportEngine = {
    activeCode: null,
    async showPreviewModal(reportCode) {
      this.activeCode = reportCode;
      const catalog = window.KasRT.Reports.Catalog;
      const reportDef = catalog.getByCode(reportCode) || { name: 'Laporan RT', code: reportCode };
      const toolbarHtml = window.KasRT.Reports.PeriodFilter ? window.KasRT.Reports.PeriodFilter.renderToolbarHtml(reportCode) : '';
      const filterMeta = window.KasRT.Reports.PeriodFilter ? window.KasRT.Reports.PeriodFilter.getPeriodMeta(reportCode) : {};
      const bodyHtml = window.KasRT.Reports.Builders.build(reportCode, filterMeta);
      const documentHtml = window.KasRT.Reports.Engine.buildDocumentShell(bodyHtml, {
        code: reportCode,
        title: reportDef.name.toUpperCase(),
        ...filterMeta
      });

      const modalHtml = `
        <div class="flex flex-col h-[90vh] max-h-[90vh]">
          <div class="report-modal-toolbar p-3 sm:p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-2.5 bg-surface-lowest flex-shrink-0">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="material-symbols-outlined text-primary text-xl flex-shrink-0">${reportDef.icon || 'description'}</span>
              <div class="min-w-0">
                <h3 class="font-extrabold text-xs sm:text-sm text-on-surface truncate">${reportDef.code}: ${reportDef.name}</h3>
                <span class="text-[10px] text-slate-500 truncate block">${reportDef.desc || 'Format laporan resmi RT/RW siap verifikasi'}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <button id="btn-toggle-paper-width" onclick="KasRT.Reports.Export.togglePaperWidth()" class="px-2.5 py-1.5 rounded-xl border border-outline-variant text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 hover:bg-surface-container transition-colors cursor-pointer" title="Beralih Format Standar A4 / Layar Penuh">
                <span class="material-symbols-outlined text-base">aspect_ratio</span>
                <span class="hidden sm:inline">Layar Penuh</span>
              </button>
              <button onclick="KasRT.Reports.Export.exportPdf('${reportCode}', 'print')" class="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center gap-1 shadow-xs hover:opacity-90 cursor-pointer" title="Cetak Dokumen">
                <span class="material-symbols-outlined text-base">print</span>
                <span>Cetak</span>
              </button>
              <button onclick="KasRT.Reports.Export.exportPdf('${reportCode}', 'download')" class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer border border-rose-700/20" style="background-color: #dc2626 !important; color: #ffffff !important;" title="Unduh Dokumen Laporan Resmi Format PDF">
                <span class="material-symbols-outlined text-base" style="color: #ffffff !important;">picture_as_pdf</span>
                <span style="color: #ffffff !important;">Unduh PDF</span>
              </button>
              <button onclick="KasRT.Reports.Export.exportExcel('${reportCode}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer" style="background-color: #059669 !important; color: #ffffff !important;" title="Ekspor Excel">
                <span class="material-symbols-outlined text-base" style="color: #ffffff !important;">table_view</span>
                <span style="color: #ffffff !important;">Excel</span>
              </button>
              <button onclick="KasRT.Reports.Export.exportDocx('${reportCode}')" class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer" style="background-color: #0284c7 !important; color: #ffffff !important;" title="Ekspor Word">
                <span class="material-symbols-outlined text-base" style="color: #ffffff !important;">description</span>
                <span style="color: #ffffff !important;">Word</span>
              </button>
              <button onclick="KasRT.UI.closeModal()" class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 cursor-pointer" title="Tutup Pratinjau">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>
          <div class="report-modal-filterbar px-4 sm:px-6 pt-2 pb-1 bg-surface-lowest border-b border-outline-variant/60 flex-shrink-0">
            ${toolbarHtml}
          </div>
          <div id="report-preview-scroll-area" class="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/80 dark:bg-slate-950 flex justify-center">
            <div id="report-rendered-paper" class="w-full max-w-5xl transition-all duration-200">
              ${documentHtml}
            </div>
          </div>
        </div>
      `;
      window.KasRT.UI.openModal(modalHtml, { size: 'full' });
      await this.injectRealSha(documentHtml);
    },

    togglePaperWidth() {
      const paper = document.getElementById('report-rendered-paper');
      const btn = document.getElementById('btn-toggle-paper-width');
      if (paper && btn) {
        if (paper.classList.contains('max-w-5xl')) {
          paper.classList.remove('max-w-5xl');
          paper.classList.add('max-w-full');
          btn.innerHTML = `<span class="material-symbols-outlined text-base">fit_screen</span><span class="hidden sm:inline">Format A4</span>`;
        } else {
          paper.classList.remove('max-w-full');
          paper.classList.add('max-w-5xl');
          btn.innerHTML = `<span class="material-symbols-outlined text-base">aspect_ratio</span><span class="hidden sm:inline">Layar Penuh</span>`;
        }
      }
    },

    async refreshActivePreview(reportCode) {
      if (!reportCode) return;
      const paper = document.getElementById('report-rendered-paper');
      if (!paper) return;
      const catalog = window.KasRT.Reports.Catalog;
      const reportDef = catalog.getByCode(reportCode) || { name: 'Laporan RT', code: reportCode };
      const filterMeta = window.KasRT.Reports.PeriodFilter ? window.KasRT.Reports.PeriodFilter.getPeriodMeta(reportCode) : {};
      const bodyHtml = window.KasRT.Reports.Builders.build(reportCode, filterMeta);
      const documentHtml = window.KasRT.Reports.Engine.buildDocumentShell(bodyHtml, {
        code: reportCode,
        title: reportDef.name.toUpperCase(),
        ...filterMeta
      });
      paper.innerHTML = documentHtml;
      await this.injectRealSha(documentHtml);
    },

    async injectRealSha(htmlContent) {
      const sha = await Utils.computeContentSha(htmlContent);
      const placeholders = document.querySelectorAll('.report-sha-placeholder');
      placeholders.forEach(el => {
        el.textContent = sha;
      });
      return sha;
    },

    getDocumentHtml(reportCode) {
      const paper = typeof document !== 'undefined' ? document.getElementById('report-rendered-paper') : null;
      if (paper && this.activeCode === reportCode && paper.innerHTML.trim().length > 50) {
        return paper.innerHTML;
      }
      const catalog = window.KasRT.Reports.Catalog;
      const reportDef = catalog.getByCode(reportCode) || { name: 'Laporan RT', code: reportCode };
      const filterMeta = window.KasRT.Reports.PeriodFilter ? window.KasRT.Reports.PeriodFilter.getPeriodMeta(reportCode) : {};
      const bodyHtml = window.KasRT.Reports.Builders.build(reportCode, filterMeta);
      return window.KasRT.Reports.Engine.buildDocumentShell(bodyHtml, {
        code: reportCode,
        title: reportDef.name.toUpperCase(),
        ...filterMeta
      });
    },

    async exportPdf(reportCode, mode = 'print') {
      if (mode === 'download') {
        await this.downloadPdf(reportCode);
      } else {
        await this.printDocument(reportCode);
      }
    },

    async printDocument(reportCode) {
      const docHtml = this.getDocumentHtml(reportCode);
      const sha = await Utils.computeContentSha(docHtml);
      const updatedHtml = docHtml.replace(/0000000000000000000000000000000000000000000000000000000000000000/g, sha);

      let printFrame = document.getElementById('kasrt-isolated-print-frame');
      if (printFrame) printFrame.remove();
      printFrame = document.createElement('iframe');
      printFrame.id = 'kasrt-isolated-print-frame';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow.document;
      const printableContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>${reportCode}_${Utils.today()}</title>
          <style>${REPORT_STANDALONE_CSS}</style>
        </head>
        <body>
          <div class="a4-document-page">
            ${updatedHtml}
          </div>
        </body>
        </html>
      `;
      frameDoc.open();
      frameDoc.write(printableContent);
      frameDoc.close();
      setTimeout(() => {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        } catch (err) {
          window.print();
        }
      }, 400);
    },

    async downloadPdf(reportCode) {
      window.KasRT.UI.showToast('Menyiapkan dokumen cetak PDF resmi...', 'info', 2500);
      await this.printDocument(reportCode);
    },

    async exportExcel(reportCode) {
      const docHtml = this.getDocumentHtml(reportCode);
      const blob = new Blob([`<html><head><meta charset="utf-8"><style>${REPORT_STANDALONE_CSS}</style></head><body>${docHtml}</body></html>`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportCode}_${Utils.today()}.xls`;
      a.click();
      URL.revokeObjectURL(url);
      window.KasRT.UI.showToast(`Laporan ${reportCode} berhasil diekspor ke Excel (.xls).`, 'success');
    },

    async exportDocx(reportCode) {
      const docHtml = this.getDocumentHtml(reportCode);
      const blob = new Blob([`<html><head><meta charset="utf-8"><style>${REPORT_STANDALONE_CSS}</style></head><body>${docHtml}</body></html>`], { type: 'application/msword;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportCode}_${Utils.today()}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      window.KasRT.UI.showToast(`Laporan ${reportCode} berhasil diunduh sebagai Word (.doc).`, 'success');
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Reports = window.KasRT.Reports || {};
  window.KasRT.Reports.Export = ExportEngine;
  window.KasRT_Reports_Export_Loaded = true;
})();
