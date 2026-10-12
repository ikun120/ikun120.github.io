/**
 * KasRT - Installments Feature Logic (Scheduled Plans & FIFO Allocation)
 * Pengajuan cicilan, jadwal termin otomatis, persetujuan, dan alokasi setoran FIFO
 */
(function() {
  'use strict';
  if (window.KasRT_Features_Installments_Loaded) return;

  const Utils = window.KasRT.Utils;

  const InstallmentsFeature = {
    previewSchedule(totalPokok, dp, jumlahTermin, frekuensi = 'bulanan', tanggalMulai = null) {
      const pokok = Utils.parseNumber(totalPokok);
      const uangMuka = Utils.parseNumber(dp);
      const sisaPokok = Math.max(0, pokok - uangMuka);
      const termin = Math.max(1, parseInt(jumlahTermin, 10) || 1);
      const angsuranPerTermin = Math.ceil(sisaPokok / termin);
      const startDate = tanggalMulai ? new Date(tanggalMulai) : new Date();
      const schedules = [];
      let kumulatif = 0;

      for (let i = 1; i <= termin; i++) {
        const dueDate = new Date(startDate);
        if (frekuensi === 'bulanan') {
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
        } else if (frekuensi === 'mingguan') {
          dueDate.setDate(dueDate.getDate() + (i - 1) * 7);
        }
        const y = dueDate.getFullYear();
        const m = String(dueDate.getMonth() + 1).padStart(2, '0');
        const d = String(dueDate.getDate()).padStart(2, '0');
        let nominalTermin = angsuranPerTermin;
        if (i === termin) {
          nominalTermin = sisaPokok - kumulatif;
        }
        kumulatif += nominalTermin;
        schedules.push({
          terminKe: i,
          tanggalJatuhTempo: `${y}-${m}-${d}`,
          nominal: nominalTermin,
          kumulatif,
          status: 'Belum Jatuh Tempo'
        });
      }

      return {
        totalPokok: pokok,
        dp: uangMuka,
        sisaPokok,
        jumlahTermin: termin,
        angsuranPerTermin,
        schedules
      };
    },

    async createPlan(planData) {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      const resident = db.get('residents', planData.residentId);
      if (!resident) throw new Error('Warga pemohon tidak ditemukan.');

      const totalPokok = Utils.parseNumber(planData.totalPokok);
      const dp = Utils.parseNumber(planData.dp || 0);
      const jumlahTermin = parseInt(planData.jumlahTermin, 10) || 3;
      if (totalPokok <= 0) throw new Error('Total pokok cicilan harus lebih besar dari 0.');

      const planId = db.nextId('PLN-2026', 'installmentPlans');
      const isPrivileged = auth && (auth.Permissions.isAdmin() || auth.Permissions.isBendahara() || auth.Permissions.isKetuaRT() || auth.Permissions.has('approve_installments'));
      const initialStatus = isPrivileged ? 'Aktif' : 'Menunggu Persetujuan';

      const planDoc = {
        id: planId,
        residentId: resident.id,
        totalPokok,
        dp,
        jumlahTermin,
        frekuensi: planData.frekuensi || 'bulanan',
        tanggalMulai: planData.tanggalMulai || Utils.today(),
        status: initialStatus,
        alasan: planData.alasan || 'Penyelesaian kewajiban lingkungan',
        requestedBy: currentUser ? currentUser.nama : resident.nama,
        requestedAt: Utils.nowISO(),
        approvedBy: isPrivileged ? (currentUser ? currentUser.nama : 'Pengurus') : null,
        approvedAt: isPrivileged ? Utils.nowISO() : null,
        totalDibayar: dp,
        createdAt: Utils.nowISO(),
        updatedAt: Utils.nowISO()
      };

      await db.set('installmentPlans', planDoc);
      if (initialStatus === 'Aktif') {
        await this.generateSchedulesForPlan(planDoc);
      }
      await db.log(currentUser?.id || 'sys', 'CREATE_INSTALLMENT_PLAN', 'installmentPlans', planId, null, planDoc);
      return planDoc;
    },

    async generateSchedulesForPlan(plan) {
      const db = window.KasRT.DB;
      const preview = this.previewSchedule(plan.totalPokok, plan.dp, plan.jumlahTermin, plan.frekuensi, plan.tanggalMulai);
      for (const item of preview.schedules) {
        const schId = `SCH-${plan.id}-${String(item.terminKe).padStart(2, '0')}`;
        const schDoc = {
          id: schId,
          planId: plan.id,
          terminKe: item.terminKe,
          tanggalJatuhTempo: item.tanggalJatuhTempo,
          nominal: item.nominal,
          kumulatif: item.kumulatif,
          status: 'Belum Jatuh Tempo',
          lunasAt: null,
          createdAt: Utils.nowISO()
        };
        await db.set('installmentSchedules', schDoc);
      }
    },

    async approvePlan(planId) {
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      const plan = db.get('installmentPlans', planId);
      if (!plan) throw new Error('Rencana cicilan tidak ditemukan.');

      const updated = await db.update('installmentPlans', plan.id, {
        status: 'Aktif',
        approvedBy: currentUser ? currentUser.nama : 'Pengurus',
        approvedAt: Utils.nowISO()
      });

      await this.generateSchedulesForPlan(updated);
      await db.log(currentUser?.id || 'sys', 'APPROVE_INSTALLMENT_PLAN', 'installmentPlans', planId, plan, updated);
      return updated;
    },

    async rejectPlan(planId, reason) {
      if (!reason || !reason.trim()) throw new Error('Alasan penolakan rencana cicilan wajib diisi.');
      const db = window.KasRT.DB;
      const auth = window.KasRT.Auth;
      const currentUser = auth ? auth.user : null;

      const plan = db.get('installmentPlans', planId);
      if (!plan) throw new Error('Rencana cicilan tidak ditemukan.');

      const updated = await db.update('installmentPlans', plan.id, {
        status: 'Ditolak',
        rejectReason: reason.trim(),
        updatedAt: Utils.nowISO()
      });

      await db.log(currentUser?.id || 'sys', 'REJECT_INSTALLMENT_PLAN', 'installmentPlans', planId, plan, updated);
      return updated;
    },

    async allocateFIFO(planId, nominalSetoran, paymentId = null) {
      const db = window.KasRT.DB;
      const plan = db.get('installmentPlans', planId);
      if (!plan) throw new Error('Rencana cicilan tidak ditemukan.');

      let amountLeft = Utils.parseNumber(nominalSetoran);
      if (amountLeft <= 0) return [];

      const schedules = db.list('installmentSchedules')
        .filter(s => s.planId === planId && s.status !== 'Lunas')
        .sort((a, b) => a.terminKe - b.terminKe);

      const allocations = [];
      for (const sch of schedules) {
        if (amountLeft <= 0) break;
        const existingAllocs = db.list('paymentAllocations')
          .filter(a => a.scheduleId === sch.id && a.status === 'Aktif');
        const alreadyPaid = existingAllocs.reduce((sum, a) => sum + (a.jumlah || 0), 0);
        const remainingTermin = Math.max(0, sch.nominal - alreadyPaid);
        if (remainingTermin <= 0) continue;

        const allocAmount = Math.min(amountLeft, remainingTermin);
        const allocId = db.nextId('ALC', 'paymentAllocations');
        const allocDoc = {
          id: allocId,
          paymentId: paymentId || `PAY-SETORAN-${Date.now()}`,
          billId: null,
          scheduleId: sch.id,
          planId: plan.id,
          jumlah: allocAmount,
          status: 'Aktif',
          createdAt: Utils.nowISO()
        };
        await db.set('paymentAllocations', allocDoc);
        allocations.push(allocDoc);
        amountLeft -= allocAmount;

        const isLunas = (alreadyPaid + allocAmount) >= sch.nominal;
        await db.update('installmentSchedules', sch.id, {
          status: isLunas ? 'Lunas' : 'Sebagian',
          lunasAt: isLunas ? Utils.nowISO() : null
        });
      }

      const totalPaidAll = (plan.totalDibayar || 0) + (Utils.parseNumber(nominalSetoran) - amountLeft);
      const isPlanCompleted = totalPaidAll >= plan.totalPokok;
      await db.update('installmentPlans', plan.id, {
        totalDibayar: totalPaidAll,
        status: isPlanCompleted ? 'Selesai' : 'Aktif',
        completedAt: isPlanCompleted ? Utils.nowISO() : null
      });

      return allocations;
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Features = window.KasRT.Features || {};
  window.KasRT.Features.Installments = InstallmentsFeature;
  window.KasRT_Features_Installments_Loaded = true;
})();
