/**
 * KasRT - Transactions Page (Tabel Kanonik 9-Kolom + Modal Transaksi Dinamis & Void)
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_Transactions_Loaded) return;

  const Utils = window.KasRT.Utils;
  let activeFilterRange = 'all';
  let activeSearch = '';
  let activeType = 'all';

  const TransactionsPage = {
    render() {
      const db = window.KasRT.DB;
      const allTrx = db.list('transactions');
      const now = new Date();

      let filtered = allTrx.filter(t => {
        if (activeType !== 'all' && t.tipe !== activeType) return false;
        if (activeSearch) {
          const s = activeSearch.toLowerCase();
          const matchKet = (t.keterangan || '').toLowerCase().includes(s);
          const matchCat = (t.categoryNameSnapshot || '').toLowerCase().includes(s);
          const matchPihak = (t.sumberDana?.nama || '').toLowerCase().includes(s);
          const matchId = (t.id || '').toLowerCase().includes(s);
          if (!matchKet && !matchCat && !matchPihak && !matchId) return false;
        }
        const tDate = new Date(t.tanggal);
        if (activeFilterRange === 'today') {
          return t.tanggal === Utils.today();
        } else if (activeFilterRange === '7d') {
          return (now - tDate) / (1000 * 3600 * 24) <= 7;
        } else if (activeFilterRange === '30d') {
          return (now - tDate) / (1000 * 3600 * 24) <= 30;
        } else if (activeFilterRange === 'month') {
          return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        } else if (activeFilterRange === 'year') {
          return tDate.getFullYear() === now.getFullYear();
        }
        return true;
      }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      const validTrx = filtered.filter(t => t.status !== 'Void');
      const totIn = validTrx.filter(t => t.tipe === 'Pemasukan').reduce((s, t) => s + (t.jumlah || 0), 0);
      const totOut = validTrx.filter(t => t.tipe === 'Pengeluaran').reduce((s, t) => s + (t.jumlah || 0), 0);
      const net = totIn - totOut;

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-black font-display text-on-surface">Buku Kas & Transaksi</h2>
              <p class="text-xs text-slate-500">Pencatatan real-time penerimaan dan pengeluaran kas lingkungan RT</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              ${(window.KasRT.Auth && window.KasRT.Auth.Permissions.has('transfer_accounts')) ? `
                <button onclick="KasRT.Pages.Transactions.openTransferModal()" class="px-3.5 py-2 rounded-xl bg-surface-lowest text-slate-700 dark:text-slate-200 border border-outline-variant hover:bg-surface-container font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-base">swap_horiz</span>
                  <span>Transfer Antar Kas</span>
                </button>
              ` : ''}
              ${(window.KasRT.Auth && window.KasRT.Auth.Permissions.has('lock_periods')) ? `
                <button onclick="KasRT.Pages.Transactions.openLockModal()" class="px-3.5 py-2 rounded-xl bg-surface-lowest text-slate-700 dark:text-slate-200 border border-outline-variant hover:bg-surface-container font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-base">lock</span>
                  <span>Tutup Buku</span>
                </button>
              ` : ''}
              ${(window.KasRT.Auth && (window.KasRT.Auth.Permissions.has('create_transactions') || window.KasRT.Auth.Permissions.has('manage_transactions'))) ? `
                <button onclick="KasRT.Pages.Transactions.openAddModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-opacity cursor-pointer">
                  <span class="material-symbols-outlined text-base">add</span>
                  <span>Transaksi Baru</span>
                </button>
              ` : ''}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex items-center justify-between">
              <div>
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pemasukan</span>
                <div class="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">${Utils.formatRp(totIn)}</div>
              </div>
              <div class="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <span class="material-symbols-outlined">arrow_downward</span>
              </div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex items-center justify-between">
              <div>
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
                <div class="text-lg font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">${Utils.formatRp(totOut)}</div>
              </div>
              <div class="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <span class="material-symbols-outlined">arrow_upward</span>
              </div>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm flex items-center justify-between">
              <div>
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Selisih Netto Periode</span>
                <div class="text-lg font-black font-mono ${net >= 0 ? 'text-primary' : 'text-rose-600'} mt-0.5">${net >= 0 ? '+' : ''}${Utils.formatRp(net)}</div>
              </div>
              <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold text-slate-400 mr-1">Rentang:</span>
              ${['all', 'today', '7d', '30d', 'month', 'year'].map(r => `
                <button onclick="KasRT.Pages.Transactions.setRange('${r}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeFilterRange === r ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-slate-600 dark:text-slate-300 hover:bg-surface-container/80'}">
                  ${{ all: 'Semua', today: 'Hari Ini', '7d': '7 Hari', '30d': '30 Hari', month: 'Bulan Ini', year: 'Tahun Ini' }[r]}
                </button>
              `).join('')}
            </div>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <select onchange="KasRT.Pages.Transactions.setType(this.value)" class="px-2.5 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs font-bold text-on-surface cursor-pointer">
                <option value="all" ${activeType === 'all' ? 'selected' : ''}>Semua Tipe</option>
                <option value="Pemasukan" ${activeType === 'Pemasukan' ? 'selected' : ''}>Pemasukan Saja</option>
                <option value="Pengeluaran" ${activeType === 'Pengeluaran' ? 'selected' : ''}>Pengeluaran Saja</option>
              </select>
              <div class="relative flex-1 sm:w-48">
                <input type="text" placeholder="Cari transaksi..." value="${activeSearch}" oninput="KasRT.Pages.Transactions.setSearch(this.value)" class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                <span class="material-symbols-outlined text-slate-400 text-sm absolute left-2.5 top-2 pointer-events-none">search</span>
              </div>
            </div>
          </div>

          <div class="bg-surface-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-surface-container/50 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant tracking-wider">
                  <tr>
                    <th class="py-3 px-3">ID</th>
                    <th class="py-3 px-3">Tanggal</th>
                    <th class="py-3 px-3">Jenis</th>
                    <th class="py-3 px-3">Keterangan</th>
                    <th class="py-3 px-3">Kategori</th>
                    <th class="py-3 px-3">Subkategori</th>
                    <th class="py-3 px-3 text-right">Nominal</th>
                    <th class="py-3 px-3 text-center">Status</th>
                    <th class="py-3 px-3">Pihak Terkait</th>
                    <th class="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/40">
                  ${filtered.length === 0 ? `
                    <tr><td colspan="10" class="py-12 text-center text-slate-400 italic">Tidak ada transaksi yang cocok dengan filter.</td></tr>
                  ` : filtered.map(t => {
                    const isVoid = t.status === 'Void';
                    const partyName = t.sumberDana?.nama || t.sumberDana?.label || '-';
                    return `
                      <tr class="hover:bg-surface-container/30 transition-colors ${isVoid ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40' : ''}">
                        <td class="py-3 px-3 font-mono text-[11px] text-slate-400">${t.id}</td>
                        <td class="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">${Utils.formatDate(t.tanggal)}</td>
                        <td class="py-3 px-3 whitespace-nowrap">
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${t.tipe === 'Pemasukan' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                            <span class="material-symbols-outlined text-xs">${t.tipe === 'Pemasukan' ? 'arrow_downward' : 'arrow_upward'}</span>
                            <span>${t.tipe}</span>
                          </span>
                        </td>
                        <td class="py-3 px-3 font-medium ${isVoid ? 'line-through text-slate-400' : 'text-on-surface'} max-w-[200px]">
                          <div>${t.keterangan || t.categoryNameSnapshot}</div>
                          ${isVoid ? `<span class="text-[10px] text-rose-500 font-bold">Dibatalkan: ${t.voidReason || ''}</span>` : ''}
                        </td>
                        <td class="py-3 px-3 whitespace-nowrap">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-slate-600 dark:text-slate-300 border border-outline-variant/60">${t.categoryNameSnapshot}</span>
                        </td>
                        <td class="py-3 px-3 whitespace-nowrap">
                          ${t.subKategori ? `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800">${t.subKategori}</span>` : '<span class="text-slate-300">-</span>'}
                        </td>
                        <td class="py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${isVoid ? 'line-through text-slate-400' : (t.tipe === 'Pemasukan' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}">
                          ${t.tipe === 'Pemasukan' ? '+' : '-'}${Utils.formatRp(t.jumlah)}
                        </td>
                        <td class="py-3 px-3 text-center whitespace-nowrap">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isVoid ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}">
                            ${t.status || 'Final'}
                          </span>
                        </td>
                        <td class="py-3 px-3 whitespace-nowrap">
                          <span class="text-[11px] text-slate-600 dark:text-slate-300">${partyName}</span>
                        </td>
                        <td class="py-3 px-3 text-center whitespace-nowrap">
                          ${isVoid ? `
                            <span class="text-[10px] text-slate-400 italic">Terkunci</span>
                          ` : `
                            <div class="flex items-center justify-center gap-1">
                              ${(window.KasRT.Auth && window.KasRT.Auth.Permissions.has('manage_transactions')) ? `
                                <button onclick="KasRT.Pages.Transactions.openEditModal('${t.id}')" title="Ubah Transaksi" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary hover:bg-surface-container cursor-pointer">
                                  <span class="material-symbols-outlined text-base">edit</span>
                                </button>
                              ` : ''}
                              ${(window.KasRT.Auth && window.KasRT.Auth.Permissions.has('void_transactions')) ? `
                                <button onclick="KasRT.Pages.Transactions.openVoidModal('${t.id}')" title="Batalkan (Void)" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer">
                                  <span class="material-symbols-outlined text-base">cancel</span>
                                </button>
                              ` : ''}
                            </div>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    },

    setRange(range) {
      activeFilterRange = range;
      window.KasRT.Events.handleRouting();
    },

    setType(type) {
      activeType = type;
      window.KasRT.Events.handleRouting();
    },

    setSearch: Utils.debounce((query) => {
      activeSearch = query;
      window.KasRT.Events.handleRouting();
    }, 150),

    openAddModal() {
      const db = window.KasRT.DB;
      const accounts = db.list('cashAccounts').filter(a => a.status === 'Aktif');
      const categories = db.list('categories').filter(c => c.aktif);
      const residents = db.list('residents').filter(r => r.status === 'Aktif');

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Catat Transaksi Kas Baru</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form id="form-trx-add" onsubmit="KasRT.Pages.Transactions.handleSubmitAdd(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1.5 text-slate-600 dark:text-slate-300">Jenis Transaksi</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-outline-variant cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50 dark:has-[:checked]:bg-emerald-950/30 transition-all">
                  <input type="radio" name="trx-tipe" value="Pemasukan" checked onchange="KasRT.Pages.Transactions.onTypeToggle('Pemasukan')" class="text-emerald-600" />
                  <span class="font-bold text-emerald-700 dark:text-emerald-300">Pemasukan (Kas Masuk)</span>
                </label>
                <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-outline-variant cursor-pointer has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50/50 dark:has-[:checked]:bg-rose-950/30 transition-all">
                  <input type="radio" name="trx-tipe" value="Pengeluaran" onchange="KasRT.Pages.Transactions.onTypeToggle('Pengeluaran')" class="text-rose-600" />
                  <span class="font-bold text-rose-700 dark:text-rose-300">Pengeluaran (Belanja/Biaya)</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Rekening / Brankas Kas</label>
              <select id="trx-account" required class="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm cursor-pointer">
                ${accounts.map(a => `<option value="${a.id}">${a.nama} (Saldo: ${Utils.formatRp(a.saldoSaatIni || 0)})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Mata Pos Kategori</label>
              <select id="trx-category" required onchange="KasRT.Pages.Transactions.onCategorySelect(this.value)" class="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm cursor-pointer">
                ${categories.filter(c => c.tipe === 'Pemasukan').map(c => `<option value="${c.id}">${c.nama}</option>`).join('')}
              </select>
            </div>
            <div id="trx-subcat-container" class="hidden">
              <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Sub-Kategori</label>
              <select id="trx-subcat" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer"></select>
            </div>
            <div id="trx-pihak-block" class="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant space-y-2">
              <label id="trx-pihak-label" class="block font-bold text-slate-600 dark:text-slate-300">Pihak Terkait (Warga)</label>
              <div id="trx-pihak-input-wrapper">
                ${window.KasRT.UI.ResidentPicker.render({
                  id: 'trx-pihak-resident',
                  placeholder: 'Ketik nama warga untuk mencari...',
                  required: true,
                  residents
                })}
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Nominal Transaksi (Rp)</label>
              ${window.KasRT.UI.renderCurrencyInput({
                id: 'trx-amount',
                placeholder: '50.000',
                required: true
              })}
              <div class="flex flex-wrap gap-1.5 mt-2">
                ${[10000, 20000, 50000, 100000, 200000, 500000].map(amt => `
                  <button type="button" onclick="KasRT.UI.setCurrencyValue('trx-amount', ${amt})" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary/20 text-slate-600 dark:text-slate-300 font-mono font-bold text-[11px] transition-colors cursor-pointer">
                    ${Utils.formatRpShort(amt)}
                  </button>
                `).join('')}
                <button type="button" onclick="KasRT.UI.setCurrencyValue('trx-amount', '')" class="px-2 py-1 rounded-lg text-slate-400 hover:text-rose-500 font-bold text-[11px] cursor-pointer">Bersihkan</button>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Tanggal</label>
                <input type="date" id="trx-date" value="${Utils.today()}" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
              </div>
              <div>
                <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Metode</label>
                <select id="trx-method" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                  <option value="Tunai">Tunai / Cash</option>
                  <option value="Transfer">Transfer Bank</option>
                  <option value="QRIS">QRIS / E-Wallet</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Keterangan / Uraian (Opsional)</label>
              <textarea id="trx-desc" rows="2" placeholder="Catatan peruntukan dana..." class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest"></textarea>
            </div>
            <div class="pt-4 border-t border-outline-variant flex items-center justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 hover:bg-surface-container rounded-xl cursor-pointer">Batal</button>
              <button type="submit" id="btn-submit-trx" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity cursor-pointer">Simpan Transaksi</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'lg' });
      const firstCat = categories.find(c => c.tipe === 'Pemasukan');
      if (firstCat) this.onCategorySelect(firstCat.id);
    },

    onTypeToggle(type) {
      const db = window.KasRT.DB;
      const categories = db.list('categories').filter(c => c.aktif && c.tipe === type);
      const catSelect = document.getElementById('trx-category');
      if (catSelect) {
        catSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.nama}</option>`).join('');
        if (categories.length > 0) this.onCategorySelect(categories[0].id);
      }
    },

    onCategorySelect(catId) {
      const db = window.KasRT.DB;
      const cat = db.get('categories', catId);
      if (!cat) return;

      const subContainer = document.getElementById('trx-subcat-container');
      const subSelect = document.getElementById('trx-subcat');
      if (cat.subItems && cat.subItems.length > 0) {
        subContainer?.classList.remove('hidden');
        if (subSelect) {
          subSelect.innerHTML = cat.subItems.map(s => `<option value="${s}">${s}</option>`).join('');
        }
      } else {
        subContainer?.classList.add('hidden');
      }

      const pihakBlock = document.getElementById('trx-pihak-block');
      const pihakLabel = document.getElementById('trx-pihak-label');
      const pihakWrapper = document.getElementById('trx-pihak-input-wrapper');

      if (!cat.membutuhkanPihak && cat.jenisPihak === 'none') {
        pihakBlock?.classList.add('hidden');
        return;
      }
      pihakBlock?.classList.remove('hidden');
      if (pihakLabel) pihakLabel.textContent = cat.pihakLabel || 'Pihak Terkait';

      if (cat.jenisPihak === 'warga') {
        const residents = db.list('residents').filter(r => r.status === 'Aktif');
        if (pihakWrapper) {
          pihakWrapper.innerHTML = window.KasRT.UI.ResidentPicker.render({
            id: 'trx-pihak-resident',
            placeholder: 'Ketik nama warga untuk mencari...',
            required: true,
            residents
          });
        }
      } else {
        if (pihakWrapper) {
          pihakWrapper.innerHTML = `
            <input type="text" id="trx-pihak-text" placeholder="Masukkan nama pihak / vendor..." class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest text-xs" />
          `;
        }
      }
    },

    async handleSubmitAdd(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-trx');
      if (btn) btn.disabled = true;

      try {
        const tipe = document.querySelector('input[name="trx-tipe"]:checked')?.value || 'Pemasukan';
        const cashAccountId = document.getElementById('trx-account')?.value;
        const categoryId = document.getElementById('trx-category')?.value;
        const subKategori = document.getElementById('trx-subcat')?.value || '';
        const jumlah = document.getElementById('trx-amount')?.value;
        const tanggal = document.getElementById('trx-date')?.value;
        const metode = document.getElementById('trx-method')?.value;
        const keterangan = document.getElementById('trx-desc')?.value;

        const db = window.KasRT.DB;
        const cat = db.get('categories', categoryId);
        let sumberDana = null;
        let resId = null;

        if (cat?.jenisPihak === 'warga') {
          resId = document.getElementById('trx-pihak-resident')?.value;
          if (!resId) {
            throw new Error('Silakan pilih nama warga dari daftar pencarian warga.');
          }
          const r = db.get('residents', resId);
          sumberDana = { tipe: 'warga', label: cat.pihakLabel, nama: r?.nama || 'Warga', residentId: resId };
        } else {
          const txt = document.getElementById('trx-pihak-text')?.value;
          sumberDana = { tipe: cat?.jenisPihak || 'bebas', label: cat?.pihakLabel, nama: txt || '-' };
        }

        await window.KasRT.Features.Transactions.addTransaction({
          tipe,
          cashAccountId,
          categoryId,
          subKategori,
          jumlah,
          tanggal,
          metode,
          keterangan,
          residentId: resId,
          sumberDana
        });

        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Transaksi berhasil dicatat dan saldo telah disesuaikan!', 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
        if (btn) btn.disabled = false;
      }
    },

    async openVoidModal(trxId) {
      const db = window.KasRT.DB;
      const trx = db.get('transactions', trxId);
      if (!trx) return;

      const reason = await window.KasRT.UI.promptInputModal({
        title: 'Batalkan (Void) Transaksi',
        message: `Anda akan membatalkan transaksi ${trx.id} (${Utils.formatRp(trx.jumlah)}). Saldo akun kas akan otomatis dikembalikan (rollback).`,
        placeholder: 'Masukkan alasan pembatalan...',
        danger: true
      });

      if (reason) {
        try {
          await window.KasRT.Features.Transactions.voidTransaction(trxId, reason);
          if (window.KasRT.UI) {
            window.KasRT.UI.showToast('Transaksi dibatalkan dan saldo kas dikembalikan.', 'info');
          }
          window.KasRT.Events.handleRouting();
        } catch (err) {
          if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
        }
      }
    },

    openEditModal(trxId) {
      const db = window.KasRT.DB;
      const trx = db.get('transactions', trxId);
      if (!trx) return;

      const accounts = db.list('cashAccounts').filter(a => a.status === 'Aktif');
      const categories = db.list('categories').filter(c => c.aktif && c.tipe === trx.tipe);

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div>
              <h3 class="text-base font-bold font-display text-on-surface">Ubah Transaksi (${trx.id})</h3>
              <p class="text-[11px] text-amber-600 font-medium">Perubahan nominal atau akun akan otomatis menyesuaikan saldo buku kas</p>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Transactions.handleSubmitEdit(event, '${trx.id}')" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Rekening Kas</label>
              <select id="edit-trx-account" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                ${accounts.map(a => `<option value="${a.id}" ${a.id === trx.cashAccountId ? 'selected' : ''}>${a.nama}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">Kategori</label>
              <select id="edit-trx-category" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                ${categories.map(c => `<option value="${c.id}" ${c.id === trx.categoryId ? 'selected' : ''}>${c.nama}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">Nominal (Rp)</label>
              ${window.KasRT.UI.renderCurrencyInput({
                id: 'edit-trx-amount',
                value: trx.jumlah,
                required: true
              })}
            </div>
            <div>
              <label class="block font-bold mb-1">Tanggal</label>
              <input type="date" id="edit-trx-date" value="${trx.tanggal}" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div>
              <label class="block font-bold mb-1">Keterangan</label>
              <textarea id="edit-trx-desc" rows="2" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest">${trx.keterangan || ''}</textarea>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitEdit(e, trxId) {
      e.preventDefault();
      try {
        const cashAccountId = document.getElementById('edit-trx-account')?.value;
        const categoryId = document.getElementById('edit-trx-category')?.value;
        const jumlah = document.getElementById('edit-trx-amount')?.value;
        const tanggal = document.getElementById('edit-trx-date')?.value;
        const keterangan = document.getElementById('edit-trx-desc')?.value;

        await window.KasRT.Features.Transactions.editTransaction(trxId, {
          cashAccountId,
          categoryId,
          jumlah,
          tanggal,
          keterangan
        });

        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Transaksi berhasil diperbarui dan saldo diselaraskan!', 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    openTransferModal() {
      const db = window.KasRT.DB;
      const accounts = db.list('cashAccounts').filter(a => a.status === 'Aktif');
      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Transfer Antar Akun Kas RT</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Transactions.handleSubmitTransfer(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Dari Akun Asal</label>
              <select id="trf-from" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                ${accounts.map(a => `<option value="${a.id}">${a.nama} (Saldo: ${Utils.formatRp(a.saldoSaatIni || 0)})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">Ke Akun Tujuan</label>
              <select id="trf-to" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                ${accounts.map(a => `<option value="${a.id}">${a.nama} (Saldo: ${Utils.formatRp(a.saldoSaatIni || 0)})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">Nominal Pemindahan (Rp)</label>
              ${window.KasRT.UI.renderCurrencyInput({
                id: 'trf-amount',
                placeholder: '1.000.000',
                required: true
              })}
            </div>
            <div>
              <label class="block font-bold mb-1">Keperluan / Catatan</label>
              <input type="text" id="trf-desc" placeholder="Setor tunai ke rekening bank..." class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Lakukan Transfer</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitTransfer(e) {
      e.preventDefault();
      try {
        const from = document.getElementById('trf-from')?.value;
        const to = document.getElementById('trf-to')?.value;
        const amt = document.getElementById('trf-amount')?.value;
        const desc = document.getElementById('trf-desc')?.value;

        await window.KasRT.Features.TransfersLocks.transfer(from, to, amt, desc);
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Transfer antar kas berhasil dilaksanakan!', 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    openLockModal() {
      const now = new Date();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Tutup Buku Periode (Period Lock)</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <p class="text-xs text-slate-500 mb-4 leading-relaxed">
            Menutup buku akan mengunci transaksi pada bulan terkait agar data laporan menjadi final dan tidak dapat diubah tanpa pembukaan kunci resmi.
          </p>
          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Bulan</label>
                <select id="lock-month" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                  ${Utils.MONTHS_ID.map((name, i) => `<option value="${i + 1}" ${i + 1 === m ? 'selected' : ''}>${name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-bold mb-1">Tahun</label>
                <input type="number" id="lock-year" value="${y}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">Catatan Pengesahan</label>
              <textarea id="lock-desc" rows="2" placeholder="Disahkan pada musyawarah pengurus..." class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest"></textarea>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button onclick="KasRT.Pages.Transactions.handleLockSubmit()" class="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold cursor-pointer">Kunci & Tutup Buku</button>
            </div>
          </div>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleLockSubmit() {
      const m = document.getElementById('lock-month')?.value;
      const y = document.getElementById('lock-year')?.value;
      const desc = document.getElementById('lock-desc')?.value;
      try {
        await window.KasRT.Features.TransfersLocks.lockPeriod(m, y, desc);
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Periode ${m}/${y} berhasil dikunci dan ditutup buku!`, 'success');
          window.KasRT.UI.closeModal();
        }
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.Transactions = TransactionsPage;
  window.KasRT_Pages_Transactions_Loaded = true;
})();
