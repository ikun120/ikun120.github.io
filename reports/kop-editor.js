/**
 * KasRT - Report KOP & Layout Live Preview Editor
 * 6 Tab: KOP Surat, Judul, Tanda Tangan Resmi, Footer Audit, Watermark, dan Token Dictionary
 */
(function() {
  'use strict';
  if (window.KasRT_Reports_KopEditor_Loaded) return;

  let activeTab = 'kop';
  let tempLayout = null;
  let isDirty = false;

  const KopEditor = {
    render() {
      if (!tempLayout) {
        tempLayout = JSON.parse(JSON.stringify(window.KasRT.Reports.Engine.get()));
      }
      const tabs = [
        { id: 'kop', label: '1. KOP Surat', icon: 'apartment' },
        { id: 'judul', label: '2. Format Judul', icon: 'title' },
        { id: 'ttd', label: '3. Tanda Tangan', icon: 'draw' },
        { id: 'audit', label: '4. Footer Audit', icon: 'verified' },
        { id: 'watermark', label: '5. Watermark', icon: 'branding_watermark' },
        { id: 'tokens', label: '6. Variabel Token', icon: 'data_object' }
      ];

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
            <div>
              <h2 class="text-lg font-black font-display text-on-surface">Editor Tata Letak & KOP Laporan</h2>
              <p class="text-xs text-slate-500">Sesuaikan kop resmi, format penomoran surat, dan tanda tangan digital RT/RW</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="KasRT.Reports.KopEditor.resetDefault()" class="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-surface-container rounded-xl border border-outline-variant transition-colors cursor-pointer">
                Reset Default
              </button>
              <button id="btn-save-layout" onclick="KasRT.Reports.KopEditor.save()" class="px-5 py-2 text-xs font-bold text-white bg-indigo-600 dark:bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 transition-all cursor-pointer ${isDirty ? 'ring-2 ring-amber-400 bg-amber-600 dark:bg-amber-600' : ''}" style="color: #ffffff !important;">
                ${isDirty ? 'Simpan (Ada Perubahan)' : 'Simpan Tata Letak'}
              </button>
            </div>
          </div>
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-outline-variant">
            ${tabs.map(t => `
              <button onclick="KasRT.Reports.KopEditor.switchTab('${t.id}')" class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500' : 'text-slate-600 dark:text-slate-400 hover:bg-surface-container'}" style="${activeTab === t.id ? 'color: #ffffff !important; background-color: #4f46e5 !important;' : ''}">
                <span class="material-symbols-outlined text-base">${t.icon}</span>
                <span>${t.label}</span>
              </button>
            `).join('')}
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-5 bg-surface-lowest rounded-3xl border border-outline-variant p-5 shadow-sm">
              ${this.renderFormForTab(activeTab)}
            </div>
            <div class="lg:col-span-7 bg-surface-container/30 rounded-3xl border border-outline-variant p-4 sm:p-6 shadow-inner">
              <div class="flex items-center justify-between mb-3 px-1">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Pratinjau Nyata Lembar Cetak</span>
                </span>
                <span class="text-[10px] text-slate-400 font-mono">Format Kertas: A4</span>
              </div>
              <div id="kop-editor-preview-container">
                ${this.renderLivePreview()}
              </div>
            </div>
          </div>
        </div>
      `;
    },

    renderFormForTab(tab) {
      const l = tempLayout;
      if (tab === 'kop') {
        return `
          <div class="space-y-4 text-xs">
            <h3 class="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-lg">apartment</span>
              <span>Header KOP Surat</span>
            </h3>
            <label class="flex items-center gap-2 font-semibold cursor-pointer">
              <input type="checkbox" ${l.kop.show ? 'checked' : ''} onchange="KasRT.Reports.KopEditor.updateField('kop.show', this.checked)" class="rounded text-primary focus:ring-primary" />
              <span>Tampilkan KOP Surat pada Laporan</span>
            </label>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Badge Singkat Wilayah</label>
              <input type="text" value="${l.kop.badgeText}" oninput="KasRT.Reports.KopEditor.updateField('kop.badgeText', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Judul Baris 1 (Nama Organisasi)</label>
              <input type="text" value="${l.kop.title}" oninput="KasRT.Reports.KopEditor.updateField('kop.title', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Subjudul Baris 2 (Sekretariat/Kelurahan)</label>
              <input type="text" value="${l.kop.subtitle}" oninput="KasRT.Reports.KopEditor.updateField('kop.subtitle', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Alamat Lengkap</label>
              <textarea oninput="KasRT.Reports.KopEditor.updateField('kop.alamat', this.value)" rows="2" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest">${l.kop.alamat}</textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">No. Telp / WA</label>
                <input type="text" value="${l.kop.telp}" oninput="KasRT.Reports.KopEditor.updateField('kop.telp', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
              </div>
              <div>
                <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Email Resmi</label>
                <input type="text" value="${l.kop.email}" oninput="KasRT.Reports.KopEditor.updateField('kop.email', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Perataan Teks</label>
                <select onchange="KasRT.Reports.KopEditor.updateField('kop.align', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest">
                  <option value="left" ${l.kop.align === 'left' ? 'selected' : ''}>Rata Kiri</option>
                  <option value="center" ${l.kop.align === 'center' ? 'selected' : ''}>Rata Tengah</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Ikon Utama</label>
                <input type="text" value="${l.kop.icon}" oninput="KasRT.Reports.KopEditor.updateField('kop.icon', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
              </div>
            </div>
          </div>
        `;
      }
      if (tab === 'judul') {
        return `
          <div class="space-y-4 text-xs">
            <h3 class="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-lg">title</span>
              <span>Format Judul & Nomor Surat</span>
            </h3>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Template Penomoran Surat</label>
              <input type="text" value="${l.title.nomorFormat}" oninput="KasRT.Reports.KopEditor.updateField('title.nomorFormat', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
              <p class="text-[10px] text-slate-400 mt-1">Variabel: {dd}, {mm}, {prefix}, {badge}, {bulanAngka}, {tahun}</p>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Template Periode</label>
              <input type="text" value="${l.title.periodeFormat}" oninput="KasRT.Reports.KopEditor.updateField('title.periodeFormat', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
            </div>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 font-semibold cursor-pointer">
                <input type="checkbox" ${l.title.underline ? 'checked' : ''} onchange="KasRT.Reports.KopEditor.updateField('title.underline', this.checked)" class="rounded text-primary" />
                <span>Garis Bawah Judul</span>
              </label>
            </div>
          </div>
        `;
      }
      if (tab === 'ttd') {
        return `
          <div class="space-y-4 text-xs">
            <h3 class="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-lg">draw</span>
              <span>Pejabat Penandatangan</span>
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Kota Penetapan</label>
                <input type="text" value="${l.signature.kota}" oninput="KasRT.Reports.KopEditor.updateField('signature.kota', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
              </div>
              <div>
                <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Mode Tanggal</label>
                <select onchange="KasRT.Reports.KopEditor.updateField('signature.tanggalMode', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest">
                  <option value="today" ${l.signature.tanggalMode === 'today' ? 'selected' : ''}>Hari Ini</option>
                  <option value="endOfMonth" ${l.signature.tanggalMode === 'endOfMonth' ? 'selected' : ''}>Akhir Bulan</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Nama Bendahara (Kiri)</label>
              <input type="text" value="${l.signature.leftNama}" oninput="KasRT.Reports.KopEditor.updateField('signature.leftNama', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Nama Ketua RT (Kanan)</label>
              <input type="text" value="${l.signature.rightNama}" oninput="KasRT.Reports.KopEditor.updateField('signature.rightNama', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
          </div>
        `;
      }
      if (tab === 'audit') {
        return `
          <div class="space-y-4 text-xs">
            <h3 class="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-lg">verified</span>
              <span>Footer Audit & Validasi Integritas</span>
            </h3>
            <div class="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant space-y-2">
              <label class="flex items-center gap-2.5 font-bold cursor-pointer text-on-surface">
                <input type="checkbox" ${l.audit.show !== false ? 'checked' : ''} onchange="KasRT.Reports.KopEditor.updateField('audit.show', this.checked)" class="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer" />
                <span>Tampilkan Catatan & Verifikasi Otomatis di Bagian Bawah Laporan</span>
              </label>
              <p class="text-[11px] text-slate-500 pl-6.5">
                Centang untuk menampilkan blok legalitas otomatis ("Dokumen ini diterbitkan secara otomatis...", Status Keabsahan, dan kode SHA-256). Hapus centang bila ingin menyembunyikannya dari lembar cetak.
              </p>
            </div>
            <div class="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant">
              <label class="flex items-center gap-2.5 font-semibold cursor-pointer text-on-surface">
                <input type="checkbox" ${l.audit.showSha !== false ? 'checked' : ''} onchange="KasRT.Reports.KopEditor.updateField('audit.showSha', this.checked)" class="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer" />
                <span>Tampilkan Baris Kode Hash Kriptografi SHA-256</span>
              </label>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Status Keabsahan</label>
              <input type="text" value="${l.audit.statusText || 'Dokumen Terbuka & Sah untuk Seluruh Warga RT'}" oninput="KasRT.Reports.KopEditor.updateField('audit.statusText', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Teks Keterangan Hukum</label>
              <textarea oninput="KasRT.Reports.KopEditor.updateField('audit.text', this.value)" rows="3" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest">${l.audit.text || 'Dokumen ini diterbitkan secara otomatis oleh Sistem KasRT dan sah tanpa stempel basah tambahan.'}</textarea>
            </div>
          </div>
        `;
      }
      if (tab === 'watermark') {
        return `
          <div class="space-y-4 text-xs">
            <h3 class="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-lg">branding_watermark</span>
              <span>Watermark Latar Dokumen</span>
            </h3>
            <label class="flex items-center gap-2 font-semibold cursor-pointer">
              <input type="checkbox" ${l.watermark.show ? 'checked' : ''} onchange="KasRT.Reports.KopEditor.updateField('watermark.show', this.checked)" class="rounded text-primary" />
              <span>Tampilkan Watermark Pengaman</span>
            </label>
            <div>
              <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Teks Watermark</label>
              <input type="text" value="${l.watermark.text}" oninput="KasRT.Reports.KopEditor.updateField('watermark.text', this.value)" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest uppercase" />
            </div>
          </div>
        `;
      }
      if (tab === 'tokens') {
        const tokens = [
          '{namaOrganisasi}', '{alamat}', '{ketua}', '{bendahara}', '{sekretaris}',
          '{kota}', '{tanggal}', '{bulan}', '{tahun}', '{nomor}', '{periodeShort}', '{badge}'
        ];
        return `
          <div class="space-y-3 text-xs">
            <h3 class="font-bold text-sm text-on-surface mb-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-lg">data_object</span>
              <span>Daftar Variabel Token Otomatis</span>
            </h3>
            <p class="text-[11px] text-slate-500 mb-3">Klik token untuk menyalin ke clipboard dan gunakan di formulir kop / nomor surat:</p>
            <div class="grid grid-cols-2 gap-2">
              ${tokens.map(t => `
                <button type="button" onclick="navigator.clipboard.writeText('${t}'); KasRT.UI.showToast('Disalin: ${t}', 'info')" class="p-2 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant font-mono text-left text-primary font-bold transition-colors cursor-pointer">
                  ${t}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }
      return '';
    },

    updateField(path, value) {
      isDirty = true;
      const parts = path.split('.');
      let cur = tempLayout;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;

      const previewContainer = document.getElementById('kop-editor-preview-container');
      if (previewContainer) {
        previewContainer.innerHTML = this.renderLivePreview();
      }
      const saveBtn = document.getElementById('btn-save-layout');
      if (saveBtn) {
        saveBtn.className = 'px-5 py-2 text-xs font-bold text-white bg-amber-600 rounded-xl shadow-md hover:bg-amber-700 transition-all cursor-pointer ring-2 ring-amber-400';
        saveBtn.style.color = '#ffffff';
        saveBtn.textContent = 'Simpan (Ada Perubahan)';
      }
    },

    renderLivePreview() {
      const sampleBody = `
        <div class="p-4 rounded-xl bg-surface-container/40 border border-outline-variant text-center text-xs text-slate-500 italic my-4">
          [ Area Isi Laporan / Data Transaksi / Rekap Keuangan ]
        </div>
      `;
      const savedEngineGet = window.KasRT.Reports.Engine.get;
      window.KasRT.Reports.Engine.get = () => tempLayout;
      const docHtml = window.KasRT.Reports.Engine.buildDocumentShell(sampleBody, {
        code: 'KAS-01',
        title: 'BUKU KAS UMUM KONSOLIDASI'
      });
      window.KasRT.Reports.Engine.get = savedEngineGet;
      return docHtml;
    },

    switchTab(tabId) {
      activeTab = tabId;
      const appEl = document.getElementById('kop-editor-root');
      if (appEl) {
        appEl.innerHTML = this.render();
      }
    },

    save() {
      window.KasRT.Reports.Engine.save(tempLayout);
      isDirty = false;
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast('Tata letak KOP dan laporan berhasil disimpan.', 'success');
      }
      const saveBtn = document.getElementById('btn-save-layout');
      if (saveBtn) {
        saveBtn.className = 'px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 transition-all cursor-pointer';
        saveBtn.style.color = '#ffffff';
        saveBtn.textContent = 'Simpan Tata Letak';
      }
    },

    resetDefault() {
      tempLayout = JSON.parse(JSON.stringify(window.KasRT.Reports.Engine.reset()));
      isDirty = false;
      if (window.KasRT.UI) {
        window.KasRT.UI.showToast('Tata letak dikembalikan ke pengaturan awal sistem.', 'info');
      }
      const appEl = document.getElementById('kop-editor-root');
      if (appEl) appEl.innerHTML = this.render();
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Reports = window.KasRT.Reports || {};
  window.KasRT.Reports.KopEditor = KopEditor;
  window.KasRT_Reports_KopEditor_Loaded = true;
})();
