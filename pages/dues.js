/**
 * KasRT - Dues Management Page
 * Matriks kepatuhan 12 bulan x KK, penerbitan tagihan massal, verifikasi setoran, dan multi-mode pembayaran
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_Dues_Loaded) return;

  const Utils = window.KasRT.Utils;

  const DuesPage = {
    render() {
      const db = window.KasRT.DB;
      const residents = db.list('residents').filter(r => r.status === 'Aktif');
      const bills = db.list('duesBills');
      const payments = db.list('duesPayments');
      const settings = db.get('settings', 'global') || {};
      const now = new Date();
      const curM = now.getMonth() + 1;
      const curY = now.getFullYear();

      const curMonthBills = bills.filter(b => b.periodeBulan === curM && b.periodeTahun === curY);
      const paidBills = curMonthBills.filter(b => b.status === 'Lunas');
      const unpaidBills = curMonthBills.filter(b => b.status !== 'Lunas');
      const complianceRate = curMonthBills.length > 0 ? Math.round((paidBills.length / curMonthBills.length) * 100) : 0;
      const pendingPayments = payments.filter(p => p.status === 'Menunggu Verifikasi');

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-black font-display text-on-surface">Tagihan & Iuran Warga</h2>
              <p class="text-xs text-slate-500">Monitoring kepatuhan setoran 12 bulan dan verifikasi pembayaran lingkungan</p>
            </div>
            ${(window.KasRT.Auth && (window.KasRT.Auth.Permissions.has('generate_dues') || window.KasRT.Auth.Permissions.has('manage_dues'))) ? `
              <div class="flex items-center gap-2">
                <button onclick="KasRT.Pages.Dues.openGenerateModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 cursor-pointer">
                  <span class="material-symbols-outlined text-base">post_add</span>
                  <span>Generate Tagihan Bulanan</span>
                </button>
              </div>
            ` : ''}
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Tarif Default / KK</span>
              <div class="text-lg font-black font-mono text-on-surface mt-0.5">${Utils.formatRp(settings.iuranDefault || 50000)}</div>
              <span class="text-[10px] text-slate-400">Jatuh tempo tgl ${settings.jatuhTempoHari || 10}</span>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Tingkat Kepatuhan</span>
              <div class="text-lg font-black font-mono text-emerald-600 mt-0.5">${complianceRate}%</div>
              <span class="text-[10px] text-slate-400">Bulan ${Utils.MONTHS_SHORT_ID[curM - 1]} ${curY}</span>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-emerald-600 uppercase">Sudah Membayar</span>
              <div class="text-lg font-black font-mono text-emerald-600 mt-0.5">${paidBills.length} KK</div>
              <span class="text-[10px] text-slate-400">${curMonthBills.length} total tagihan</span>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-rose-600 uppercase">Belum Lunas</span>
              <div class="text-lg font-black font-mono text-rose-600 mt-0.5">${unpaidBills.length} KK</div>
              <span class="text-[10px] text-rose-500 font-semibold">Perlu tindak lanjut</span>
            </div>
          </div>

          ${pendingPayments.length > 0 ? `
            <div class="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-600 text-xl animate-bounce">pending_actions</span>
                  <h3 class="font-bold text-sm text-amber-900 dark:text-amber-200">${pendingPayments.length} Pembayaran Menunggu Verifikasi</h3>
                </div>
                <span class="text-xs text-amber-700 dark:text-amber-300 font-medium">Harap periksa bukti setor warga</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${pendingPayments.map(p => {
                  const res = db.get('residents', p.residentId);
                  return `
                    <div class="p-3.5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm flex items-center justify-between">
                      <div>
                        <div class="font-bold text-xs text-on-surface">${res ? res.nama : 'Warga'}</div>
                        <div class="text-[11px] font-mono text-slate-500">${Utils.formatRp(p.jumlah)} | ${p.metode}</div>
                        <div class="text-[10px] text-slate-400">${Utils.formatDate(p.tanggalBayar)}</div>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <button onclick="KasRT.Pages.Dues.handleVerify('${p.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:opacity-90 cursor-pointer">
                          Setujui
                        </button>
                        <button onclick="KasRT.Pages.Dues.handleReject('${p.id}')" class="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm hover:opacity-90 cursor-pointer">
                          Tolak
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <div class="bg-surface-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden p-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 class="font-bold text-sm text-on-surface font-display">Matriks Pembayaran Iuran (Tahun ${curY})</h3>
                <p class="text-xs text-slate-500">Klik sel kotak untuk mencatat setoran warga langsung</p>
              </div>
              <div class="flex items-center gap-3 text-[11px] font-bold">
                <span class="flex items-center gap-1 text-emerald-600"><span class="w-3 h-3 rounded bg-emerald-100 flex items-center justify-center text-[9px]">✓</span> Lunas</span>
                <span class="flex items-center gap-1 text-amber-500"><span class="w-3 h-3 rounded bg-amber-100 flex items-center justify-center text-[9px]">½</span> Sebagian</span>
                <span class="flex items-center gap-1 text-rose-500"><span class="w-3 h-3 rounded bg-rose-100 flex items-center justify-center text-[9px]">✗</span> Belum</span>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left border-collapse">
                <thead>
                  <tr class="bg-surface-container/60 text-[10px] uppercase font-bold text-slate-400 border-b border-outline-variant">
                    <th class="py-2.5 px-3">Warga</th>
                    ${Array.from({ length: 12 }, (_, i) => {
                      const m = i + 1;
                      const isCurrent = m === curM;
                      return `
                        <th class="py-2.5 px-2 text-center ${isCurrent ? 'bg-primary/20 text-primary font-black rounded-t-lg' : ''}">
                          ${Utils.MONTHS_SHORT_ID[i]}
                        </th>
                      `;
                    }).join('')}
                    <th class="py-2.5 px-3 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/50">
                  ${residents.map((r) => {
                    const monthCells = Array.from({ length: 12 }, (_, i) => {
                      const m = i + 1;
                      const bill = bills.find(b => b.residentId === r.id && b.periodeBulan === m && b.periodeTahun === curY);
                      const isCurrent = m === curM;
                      if (!bill) {
                        return `<td class="py-2.5 px-1 text-center ${isCurrent ? 'bg-primary/5' : ''}"><span class="text-slate-300">-</span></td>`;
                      }
                      let icon = '✗';
                      let colorClass = 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100';
                      if (bill.status === 'Lunas') {
                        icon = '✓';
                        colorClass = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100';
                      } else if (bill.status === 'Sebagian') {
                        icon = '½';
                        colorClass = 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 hover:bg-amber-100';
                      }
                      return `
                        <td class="py-2 px-1 text-center ${isCurrent ? 'bg-primary/5' : ''}">
                          <button onclick="KasRT.Pages.Dues.openPaymentModal('${bill.id}')" title="${r.nama} - Bulan ${m}/${curY}: ${bill.status} (${Utils.formatRp(bill.jumlahDibayar || 0)}/${Utils.formatRp(bill.nominal)})" class="w-7 h-7 rounded-lg ${colorClass} font-black text-xs transition-transform hover:scale-110 flex items-center justify-center mx-auto cursor-pointer">
                            ${icon}
                          </button>
                        </td>
                      `;
                    }).join('');
                    return `
                      <tr class="hover:bg-surface-container/30">
                        <td class="py-2.5 px-3 font-bold text-on-surface whitespace-nowrap">
                          <div>${r.nama}</div>
                          <span class="text-[10px] text-slate-400 font-normal">${r.alamat || 'RT 01'}</span>
                        </td>
                        ${monthCells}
                        <td class="py-2.5 px-3 text-center whitespace-nowrap">
                          <button onclick="KasRT.Pages.Dues.sendWaBlast('${r.id}')" title="Kirim Pengingat WhatsApp" class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer">
                            <span class="material-symbols-outlined text-base">chat</span>
                          </button>
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

    openPaymentModal(billId) {
      const db = window.KasRT.DB;
      const bill = db.get('duesBills', billId);
      if (!bill) return;
      const resident = db.get('residents', bill.residentId);
      const accounts = db.list('cashAccounts').filter(a => a.status === 'Aktif');
      const sisa = Math.max(0, bill.nominal - (bill.jumlahDibayar || 0));

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div>
              <h3 class="text-base font-bold font-display text-on-surface">Catat Pembayaran Iuran</h3>
              <p class="text-xs text-slate-500">${resident ? resident.nama : 'Warga'} | Periode Bulan ${bill.periodeBulan}/${bill.periodeTahun}</p>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Dues.handleSubmitPayment(event, '${bill.id}')" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1 text-slate-600 dark:text-slate-300">Mode Pembayaran</label>
              <div class="grid grid-cols-3 gap-2">
                <label class="flex items-center justify-center p-2.5 rounded-xl border border-outline-variant cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                  <input type="radio" name="pay-mode" value="Penuh" checked onchange="document.getElementById('pay-amt').value = ${sisa}" />
                  <span class="font-bold ml-1.5">Lunas Penuh</span>
                </label>
                <label class="flex items-center justify-center p-2.5 rounded-xl border border-outline-variant cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                  <input type="radio" name="pay-mode" value="Sebagian" onchange="document.getElementById('pay-amt').value = ${Math.round(sisa / 2)}" />
                  <span class="font-bold ml-1.5">Sebagian</span>
                </label>
                <label class="flex items-center justify-center p-2.5 rounded-xl border border-outline-variant cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10" onclick="KasRT.UI.closeModal(); KasRT.Events.navigate('#/app/cicilan');">
                  <span class="font-bold text-primary">Skema Cicilan →</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">Setor ke Rekening / Kas</label>
              <select id="pay-account" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                ${accounts.map(a => `<option value="${a.id}">${a.nama} (Saldo: ${Utils.formatRp(a.saldoSaatIni || 0)})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">Nominal Setoran (Rp)</label>
              ${window.KasRT.UI.renderCurrencyInput({
                id: 'pay-amt',
                value: sisa,
                required: true
              })}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Tanggal Bayar</label>
                <input type="date" id="pay-date" value="${Utils.today()}" required class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest" />
              </div>
              <div>
                <label class="block font-bold mb-1">Metode</label>
                <select id="pay-method" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                  <option value="Tunai">Tunai / Cash</option>
                  <option value="Transfer">Transfer BCA/Mandiri</option>
                  <option value="QRIS">QRIS Kas RT</option>
                </select>
              </div>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan Pembayaran</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitPayment(e, billId) {
      e.preventDefault();
      try {
        const cashAccountId = document.getElementById('pay-account')?.value;
        const jumlah = document.getElementById('pay-amt')?.value;
        const tanggalBayar = document.getElementById('pay-date')?.value;
        const metode = document.getElementById('pay-method')?.value;
        const mode = document.querySelector('input[name="pay-mode"]:checked')?.value || 'Penuh';
        await window.KasRT.Features.Dues.recordPayment({
          billId,
          cashAccountId,
          jumlah,
          tanggalBayar,
          metode,
          mode
        });
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Pembayaran iuran berhasil dicatat dan diverifikasi!', 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    openGenerateModal() {
      const now = new Date();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Penerbitan Tagihan Iuran Massal</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <p class="text-xs text-slate-500 mb-4 leading-relaxed">
            Sistem akan secara otomatis membuatkan tagihan iuran rutin bulanan untuk seluruh Kepala Keluarga aktif di lingkungan RT.
          </p>
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Bulan Periode</label>
                <select id="gen-month" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                  ${Utils.MONTHS_ID.map((name, i) => `<option value="${i + 1}" ${i + 1 === m ? 'selected' : ''}>${name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-bold mb-1">Tahun Periode</label>
                <input type="number" id="gen-year" value="${y}" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-mono" />
              </div>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button onclick="KasRT.Pages.Dues.handleGenerateSubmit()" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Terbitkan Tagihan Sekarang</button>
            </div>
          </div>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'sm' });
    },

    async handleGenerateSubmit() {
      const m = document.getElementById('gen-month')?.value;
      const y = document.getElementById('gen-year')?.value;
      try {
        const res = await window.KasRT.Features.Dues.generateBills(m, y);
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast(`Berhasil! Diterbitkan ${res.generatedCount} tagihan baru (${res.skippedCount} sudah ada sebelumnya).`, 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    async handleVerify(paymentId) {
      try {
        await window.KasRT.Features.Dues.verifyPayment(paymentId);
        if (window.KasRT.UI) window.KasRT.UI.showToast('Pembayaran berhasil diverifikasi dan masuk kas!', 'success');
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    async handleReject(paymentId) {
      const reason = await window.KasRT.UI.promptInputModal({
        title: 'Tolak Pembayaran',
        message: 'Masukkan alasan penolakan bukti setoran iuran:',
        placeholder: 'Bukti transfer tidak terbaca...',
        danger: true
      });
      if (reason) {
        try {
          await window.KasRT.Features.Dues.rejectPayment(paymentId, reason);
          if (window.KasRT.UI) window.KasRT.UI.showToast('Pembayaran ditolak.', 'info');
          window.KasRT.Events.handleRouting();
        } catch (err) {
          if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
        }
      }
    },

    sendWaBlast(residentId) {
      const db = window.KasRT.DB;
      const bills = db.list('duesBills').filter(b => b.residentId === residentId && b.status !== 'Lunas');
      if (bills.length === 0) {
        window.KasRT.UI.showToast('Warga ini tidak memiliki tunggakan iuran.', 'info');
        return;
      }
      const url = window.KasRT.Features.Dues.getWaReminderUrl(bills[0]);
      if (url) {
        window.open(url, '_blank');
      } else {
        window.KasRT.UI.showToast('Nomor WhatsApp warga belum terdaftar.', 'warning');
      }
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.Dues = DuesPage;
  window.KasRT_Pages_Dues_Loaded = true;
})();
