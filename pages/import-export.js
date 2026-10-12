/**
 * KasRT - Import & Export Management Page
 * Cadangan penuh database (Backup & Restore JSON) dan pertukaran data warga via Excel/CSV
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_ImportExport_Loaded) return;

  const Utils = window.KasRT.Utils;

  const ImportExportPage = {
    render() {
      const auth = window.KasRT.Auth;
      if (!auth || !auth.Permissions.has('import_export_data')) {
        return window.KasRT.Shell.renderForbidden('import_export_data', '/app/import-export');
      }

      return `
        <div class="space-y-6">
          <div>
            <h2 class="text-xl font-black font-display text-on-surface">Import & Export Data</h2>
            <p class="text-xs text-slate-500">Pencadangan menyeluruh database dan transfer data warga ke berkas spreadsheet</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div class="bg-surface-lowest rounded-3xl border border-outline-variant p-6 shadow-sm space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                  <span class="material-symbols-outlined text-2xl">database</span>
                </div>
                <div>
                  <h3 class="font-bold text-sm text-on-surface">Cadangan Penuh Sistem (Full Backup)</h3>
                  <p class="text-xs text-slate-500">Unduh seluruh 31 koleksi database KasRT</p>
                </div>
              </div>
              <p class="text-xs text-slate-500 leading-relaxed">
                Berkas cadangan JSON memuat seluruh master warga, transaksi kas, tagihan iuran, jadwal cicilan, data inventaris, log aktivitas sistem, dan pengaturan.
              </p>
              <div class="pt-2 flex flex-col sm:flex-row gap-3">
                <button onclick="KasRT.Pages.ImportExport.handleExportJson()" class="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-90 cursor-pointer">
                  <span class="material-symbols-outlined text-base">download</span>
                  <span>Unduh Backup JSON</span>
                </button>
                <label class="flex-1 py-2.5 px-4 rounded-xl bg-surface-lowest border border-outline-variant hover:bg-surface-container font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200">
                  <span class="material-symbols-outlined text-base">upload</span>
                  <span>Restore Cadangan</span>
                  <input type="file" accept=".json" onchange="KasRT.Pages.ImportExport.handleRestoreJson(event)" class="hidden" />
                </label>
              </div>
            </div>

            <div class="bg-surface-lowest rounded-3xl border border-outline-variant p-6 shadow-sm space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
                  <span class="material-symbols-outlined text-2xl">table_chart</span>
                </div>
                <div>
                  <h3 class="font-bold text-sm text-on-surface">Data Induk Warga (Spreadsheet)</h3>
                  <p class="text-xs text-slate-500">Ekspor atau impor massal data warga RT</p>
                </div>
              </div>
              <p class="text-xs text-slate-500 leading-relaxed">
                Format kolom yang didukung: ID, Nama Lengkap, NIK, Alamat Rumah, No HP/WhatsApp, Status Kependudukan, dan Catatan.
              </p>
              <div class="pt-2 flex flex-col sm:flex-row gap-3">
                <button onclick="KasRT.Pages.ImportExport.handleExportResidentsCsv()" class="flex-1 py-2.5 px-4 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-90 cursor-pointer">
                  <span class="material-symbols-outlined text-base">file_download</span>
                  <span>Ekspor Warga (.csv)</span>
                </button>
                <label class="flex-1 py-2.5 px-4 rounded-xl bg-surface-lowest border border-outline-variant hover:bg-surface-container font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200">
                  <span class="material-symbols-outlined text-base">file_upload</span>
                  <span>Impor Warga (.csv)</span>
                  <input type="file" accept=".csv,.xlsx" onchange="KasRT.Pages.ImportExport.handleImportResidentsCsv(event)" class="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    handleExportJson() {
      const db = window.KasRT.DB;
      const data = db.cache;
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KasRT_FullBackup_${Utils.today()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      window.KasRT.UI.showToast('Cadangan database penuh berhasil diunduh.', 'success');
    },

    async handleRestoreJson(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      const confirm = await window.KasRT.UI.confirmModal({
        title: 'Konfirmasi Restore Cadangan',
        message: 'Memulihkan cadangan akan menggantikan data yang sedang aktif dengan data yang ada di dalam berkas backup. Lanjutkan?',
        danger: true
      });
      if (!confirm) return;

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!parsed.settings && !parsed.residents && !parsed.transactions) {
          throw new Error('Format berkas cadangan JSON tidak valid atau rusak.');
        }

        const db = window.KasRT.DB;
        Object.keys(parsed).forEach(col => {
          if (Array.isArray(parsed[col])) {
            db.cache[col] = parsed[col];
          }
        });
        db.persistDemo();

        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Database berhasil dipulihkan dari cadangan!', 'success');
        }
        window.KasRT.Events.navigate('#/app/dashboard');
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Gagal memulihkan cadangan: ' + err.message, 'error');
      }
    },

    handleExportResidentsCsv() {
      const db = window.KasRT.DB;
      const residents = db.list('residents');
      let csv = 'ID,Nama,NIK,Alamat,NoHp,Status,Catatan\n';
      residents.forEach(r => {
        csv += `"${r.id}","${r.nama}","${r.nik || ''}","${r.alamat || ''}","${r.noHp || ''}","${r.status || 'Aktif'}","${r.catatan || ''}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Warga_KasRT_${Utils.today()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      window.KasRT.UI.showToast('Data warga berhasil diekspor ke CSV.', 'success');
    },

    async handleImportResidentsCsv(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length <= 1) throw new Error('Berkas CSV kosong atau tidak memiliki baris data.');

        const db = window.KasRT.DB;
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
          if (parts.length >= 2 && parts[1]) {
            const id = parts[0] || db.nextId('WRG', 'residents');
            const nama = parts[1];
            const nik = parts[2] || '';
            const alamat = parts[3] || 'RT 01';
            const noHp = parts[4] || '';
            const status = parts[5] || 'Aktif';
            const catatan = parts[6] || 'Diimpor via CSV';

            await db.set('residents', {
              id, nama, nik, alamat, noHp, status, catatan
            });
            imported++;
          }
        }

        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Berhasil mengimpor ${imported} data warga!`, 'success');
        }
        window.KasRT.Events.navigate('#/app/warga');
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast('Gagal impor CSV: ' + err.message, 'error');
      }
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.ImportExport = ImportExportPage;
  window.KasRT_Pages_ImportExport_Loaded = true;
})();
