/**
 * KasRT - Installments Page (Scheduled Portfolios, FIFO Allocation & Simulator)
 * Pengajuan cicilan kewajiban warga, persetujuan pengurus, pencatatan setoran FIFO, dan simulator angsuran
 */
(function() {
  'use strict';
  if (window.KasRT_Pages_Installments_Loaded) return;

  const Utils = window.KasRT.Utils;

  const InstallmentsPage = {
    render() {
      const db = window.KasRT.DB;
      const plans = db.list('installmentPlans');
      const residents = db.list('residents');
      const totalPokok = plans.reduce((s, p) => s + (p.totalPokok || 0), 0);
      const totalDibayar = plans.reduce((s, p) => s + (p.totalDibayar || 0), 0);
      const activePlans = plans.filter(p => p.status === 'Aktif');
      const pendingPlans = plans.filter(p => p.status === 'Menunggu Persetujuan');

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-black font-display text-on-surface">Cicilan & Skema Angsuran Terjadwal</h2>
              <p class="text-xs text-slate-500">Penyelesaian tunggakan iuran & kewajiban warga dengan skema bertahap</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="KasRT.Pages.Installments.openNewPlanModal()" class="px-4 py-2 rounded-xl bg-theme-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 cursor-pointer">
                <span class="material-symbols-outlined text-base">add</span>
                <span>Ajukan Rencana Cicilan</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Portofolio Pokok</span>
              <div class="text-lg font-black font-mono text-on-surface mt-0.5">${Utils.formatRp(totalPokok)}</div>
              <span class="text-[10px] text-slate-400">${plans.length} rencana tercatat</span>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-emerald-600 uppercase">Total Terbayar</span>
              <div class="text-lg font-black font-mono text-emerald-600 mt-0.5">${Utils.formatRp(totalDibayar)}</div>
              <span class="text-[10px] text-slate-400">Teralokasi FIFO</span>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-primary uppercase">Rencana Aktif</span>
              <div class="text-lg font-black font-mono text-primary mt-0.5">${activePlans.length} Berjalan</div>
              <span class="text-[10px] text-slate-400">On-Track</span>
            </div>
            <div class="p-4 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm">
              <span class="text-[10px] font-bold text-amber-600 uppercase">Menunggu Otorisasi</span>
              <div class="text-lg font-black font-mono text-amber-600 mt-0.5">${pendingPlans.length} Rencana</div>
              <span class="text-[10px] text-slate-400">Butuh persetujuan</span>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-8 space-y-4">
              <h3 class="font-bold text-sm text-on-surface font-display flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-lg">view_list</span>
                <span>Daftar Rencana Cicilan Warga</span>
              </h3>
              ${plans.length === 0 ? `
                <div class="p-12 text-center rounded-3xl bg-surface-lowest border border-outline-variant text-slate-400 text-xs italic">
                  Belum ada rencana cicilan terjadwal.
                </div>
              ` : plans.map(p => {
                const res = residents.find(r => r.id === p.residentId) || { nama: 'Warga' };
                const paid = p.totalDibayar || 0;
                const sisa = Math.max(0, p.totalPokok - paid);
                const percent = Math.min(100, Math.round((paid / p.totalPokok) * 100));
                const isPending = p.status === 'Menunggu Persetujuan';
                const isDone = p.status === 'Selesai';
                return `
                  <div class="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="font-bold text-base text-on-surface">${res.nama}</h4>
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isPending ? 'bg-amber-100 text-amber-800' : (isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-primary/10 text-primary')}">
                            ${p.status}
                          </span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">${p.alasan || 'Penyelesaian kewajiban lingkungan'}</p>
                      </div>
                      <span class="text-[11px] font-mono text-slate-400">${p.id}</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-surface-container/40 text-xs">
                      <div>
                        <span class="text-[10px] text-slate-400 uppercase font-semibold">Total Pokok</span>
                        <div class="font-black font-mono text-on-surface">${Utils.formatRp(p.totalPokok)}</div>
                      </div>
                      <div>
                        <span class="text-[10px] text-slate-400 uppercase font-semibold">Skema</span>
                        <div class="font-black font-mono text-on-surface">${p.jumlahTermin}x ${p.frekuensi}</div>
                      </div>
                      <div>
                        <span class="text-[10px] text-emerald-600 uppercase font-semibold">Terbayar</span>
                        <div class="font-black font-mono text-emerald-600">${Utils.formatRp(paid)}</div>
                      </div>
                      <div>
                        <span class="text-[10px] text-rose-600 uppercase font-semibold">Sisa Pokok</span>
                        <div class="font-black font-mono text-rose-600">${Utils.formatRp(sisa)}</div>
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between text-[11px] font-bold mb-1">
                        <span class="text-slate-400">Progres Pelunasan</span>
                        <span class="text-primary font-mono">${percent}%</span>
                      </div>
                      <div class="h-2 rounded-full bg-surface-container overflow-hidden">
                        <div class="h-full bg-primary rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                      </div>
                    </div>
                    <div class="pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                      <span class="text-[11px] text-slate-400 font-mono">Mulai: ${Utils.formatDate(p.tanggalMulai)}</span>
                      <div class="flex items-center gap-2">
                        ${isPending ? `
                          <button onclick="KasRT.Pages.Installments.handleApprove('${p.id}')" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:opacity-90 cursor-pointer">Setujui</button>
                          <button onclick="KasRT.Pages.Installments.handleReject('${p.id}')" class="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm hover:opacity-90 cursor-pointer">Tolak</button>
                        ` : `
                          ${!isDone ? `
                            <button onclick="KasRT.Pages.Installments.openDepositModal('${p.id}')" class="px-3.5 py-1.5 rounded-xl bg-theme-gradient text-white font-bold text-xs shadow-sm hover:opacity-90 flex items-center gap-1.5 cursor-pointer">
                              <span class="material-symbols-outlined text-sm">payments</span>
                              <span>Catat Setoran FIFO</span>
                            </button>
                          ` : ''}
                        `}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Simulator Cicilan Sidebar -->
            <div class="lg:col-span-4 bg-surface-lowest rounded-3xl border border-outline-variant p-6 shadow-sm sticky top-24 space-y-4 text-xs">
              <h3 class="font-bold text-sm text-on-surface font-display flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-500 text-lg">calculate</span>
                <span>Simulasi Perhitungan Tenor</span>
              </h3>
              <p class="text-slate-500">Hitung estimasi angsuran bulanan yang terjangkau bagi warga:</p>
              <div>
                <label class="block font-bold mb-1">Total Tunggakan Pokok (Rp)</label>
                ${window.KasRT.UI.renderCurrencyInput({
                  id: 'sim-pokok',
                  value: 300000,
                  oninput: 'KasRT.Pages.Installments.runSimulation()'
                })}
              </div>
              <div>
                <label class="block font-bold mb-1">Uang Muka / DP Awal (Rp)</label>
                ${window.KasRT.UI.renderCurrencyInput({
                  id: 'sim-dp',
                  value: 50000,
                  oninput: 'KasRT.Pages.Installments.runSimulation()'
                })}
              </div>
              <div>
                <label class="block font-bold mb-1">Pilihan Tenor / Termin</label>
                <select id="sim-tenor" onchange="KasRT.Pages.Installments.runSimulation()" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest font-bold cursor-pointer">
                  <option value="3">3 Bulan (Ringan)</option>
                  <option value="5" selected>5 Bulan (Standar)</option>
                  <option value="6">6 Bulan</option>
                  <option value="10">10 Bulan</option>
                  <option value="12">12 Bulan (Maksimal)</option>
                </select>
              </div>
              <div id="sim-output" class="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant space-y-2 mt-4">
                <div class="flex justify-between">
                  <span class="text-slate-500">Sisa Pokok Bersih:</span>
                  <span id="sim-res-sisa" class="font-bold font-mono">Rp 250.000</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-outline-variant/60">
                  <span class="font-bold text-on-surface">Angsuran / Bulan:</span>
                  <span id="sim-res-angsuran" class="font-black font-mono text-primary text-sm">Rp 50.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    runSimulation() {
      const pokok = document.getElementById('sim-pokok')?.value;
      const dp = document.getElementById('sim-dp')?.value;
      const tenor = document.getElementById('sim-tenor')?.value;
      const res = window.KasRT.Features.Installments.previewSchedule(pokok, dp, tenor);
      const sisaEl = document.getElementById('sim-res-sisa');
      const angEl = document.getElementById('sim-res-angsuran');
      if (sisaEl) sisaEl.textContent = Utils.formatRp(res.sisaPokok);
      if (angEl) angEl.textContent = Utils.formatRp(res.angsuranPerTermin);
    },

    openNewPlanModal() {
      const db = window.KasRT.DB;
      const residents = db.list('residents').filter(r => r.status === 'Aktif');
      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <h3 class="text-base font-bold font-display text-on-surface">Ajukan Rencana Cicilan Baru</h3>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Installments.handleSubmitPlan(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold mb-1">Warga Pemohon</label>
              ${window.KasRT.UI.ResidentPicker.render({
                id: 'plan-resident',
                placeholder: 'Ketik nama warga pemohon...',
                required: true,
                residents
              })}
            </div>
            <div>
              <label class="block font-bold mb-1">Total Pokok Kewajiban (Rp)</label>
              ${window.KasRT.UI.renderCurrencyInput({
                id: 'plan-pokok',
                placeholder: '300.000',
                required: true
              })}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Uang Muka / DP (Rp)</label>
                ${window.KasRT.UI.renderCurrencyInput({
                  id: 'plan-dp',
                  value: 0
                })}
              </div>
              <div>
                <label class="block font-bold mb-1">Jumlah Termin (Bulan)</label>
                <select id="plan-termin" class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest cursor-pointer">
                  <option value="3">3 Kali</option>
                  <option value="5">5 Kali</option>
                  <option value="6" selected>6 Kali</option>
                  <option value="10">10 Kali</option>
                  <option value="12">12 Kali</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">Alasan Pengajuan</label>
              <textarea id="plan-alasan" rows="2" placeholder="Penyelesaian akumulasi tunggakan iuran semester lalu..." class="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-lowest"></textarea>
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Simpan & Terbitkan</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'md' });
    },

    async handleSubmitPlan(e) {
      e.preventDefault();
      try {
        const residentId = document.getElementById('plan-resident')?.value;
        if (!residentId) {
          throw new Error('Silakan pilih nama warga pemohon dari daftar pencarian warga.');
        }
        const totalPokok = document.getElementById('plan-pokok')?.value;
        const dp = document.getElementById('plan-dp')?.value;
        const jumlahTermin = document.getElementById('plan-termin')?.value;
        const alasan = document.getElementById('plan-alasan')?.value;

        await window.KasRT.Features.Installments.createPlan({
          residentId,
          totalPokok,
          dp,
          jumlahTermin,
          alasan
        });

        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Rencana cicilan berhasil didaftarkan!', 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    openDepositModal(planId) {
      const db = window.KasRT.DB;
      const plan = db.get('installmentPlans', planId);
      if (!plan) return;
      const res = db.get('residents', plan.residentId);
      const sisa = Math.max(0, plan.totalPokok - (plan.totalDibayar || 0));

      const html = `
        <div class="p-6 overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div>
              <h3 class="text-base font-bold font-display text-on-surface">Catat Setoran Angsuran</h3>
              <p class="text-xs text-slate-500">${res ? res.nama : 'Warga'} | Sisa Pokok: ${Utils.formatRp(sisa)}</p>
            </div>
            <button onclick="KasRT.UI.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <form onsubmit="KasRT.Pages.Installments.handleSubmitDeposit(event, '${plan.id}')" class="space-y-4 text-xs">
            <div class="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-primary border border-indigo-200 dark:border-indigo-800 text-[11px] leading-relaxed">
              Sistem akan mengalokasikan setoran ke jadwal termin terlama yang belum lunas secara otomatis (FIFO Engine).
            </div>
            <div>
              <label class="block font-bold mb-1">Nominal Setoran (Rp)</label>
              ${window.KasRT.UI.renderCurrencyInput({
                id: 'dep-amt',
                value: 50000,
                required: true
              })}
            </div>
            <div class="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onclick="KasRT.UI.closeModal()" class="px-4 py-2 font-bold text-slate-500 cursor-pointer">Batal</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-theme-gradient text-white font-bold cursor-pointer">Alokasikan Setoran</button>
            </div>
          </form>
        </div>
      `;
      window.KasRT.UI.openModal(html, { size: 'sm' });
    },

    async handleSubmitDeposit(e, planId) {
      e.preventDefault();
      try {
        const amt = document.getElementById('dep-amt')?.value;
        await window.KasRT.Features.Installments.allocateFIFO(planId, amt);
        if (window.KasRT.UI) {
          window.KasRT.UI.showToast('Setoran berhasil dialokasikan sesuai urutan termin FIFO!', 'success');
          window.KasRT.UI.closeModal();
        }
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    async handleApprove(planId) {
      try {
        await window.KasRT.Features.Installments.approvePlan(planId);
        if (window.KasRT.UI) window.KasRT.UI.showToast('Rencana cicilan disetujui & jadwal termin terbit!', 'success');
        window.KasRT.Events.handleRouting();
      } catch (err) {
        if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
      }
    },

    async handleReject(planId) {
      const reason = await window.KasRT.UI.promptInputModal({
        title: 'Tolak Rencana Cicilan',
        message: 'Masukkan alasan penolakan rencana cicilan:',
        placeholder: 'Tenor terlalu panjang / belum disepakati...',
        danger: true
      });
      if (reason) {
        try {
          await window.KasRT.Features.Installments.rejectPlan(planId, reason);
          if (window.KasRT.UI) window.KasRT.UI.showToast('Rencana cicilan ditolak.', 'info');
          window.KasRT.Events.handleRouting();
        } catch (err) {
          if (window.KasRT.UI) window.KasRT.UI.showToast(err.message, 'error');
        }
      }
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Pages = window.KasRT.Pages || {};
  window.KasRT.Pages.Installments = InstallmentsPage;
  window.KasRT_Pages_Installments_Loaded = true;
})();
