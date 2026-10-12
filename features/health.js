/**
 * KasRT - System Health & Data Integrity Engine
 * Deteksi duplikasi ID, verifikasi kategori yatim, audit saldo drift, dan auto-repair akun kas
 */
(function() {
  'use strict';
  if (window.KasRT_Features_Health_Loaded) return;

  const HealthFeature = {
    dedupe(colName) {
      const db = window.KasRT.DB;
      if (!db || !db.cache[colName]) return 0;
      const seen = new Set();
      const original = db.cache[colName];
      const deduped = [];
      let duplicatesRemoved = 0;

      for (const item of original) {
        if (!item || !item.id) continue;
        if (seen.has(item.id)) {
          duplicatesRemoved++;
        } else {
          seen.add(item.id);
          deduped.push(item);
        }
      }

      if (duplicatesRemoved > 0) {
        db.cache[colName] = deduped;
        db.persistDemo();
      }
      return duplicatesRemoved;
    },

    dedupeAll() {
      const db = window.KasRT.DB;
      if (!db) return {};
      const results = {};
      Object.keys(db.cache).forEach(col => {
        const count = this.dedupe(col);
        if (count > 0) results[col] = count;
      });
      return results;
    },

    scanIntegrity() {
      const db = window.KasRT.DB;
      const issues = [];
      const fixesAvailable = [];

      const accounts = db.list('cashAccounts');
      const transactions = db.list('transactions').filter(t => t.status !== 'Void');

      accounts.forEach(acc => {
        const accTrx = transactions.filter(t => t.cashAccountId === acc.id);
        const inTotal = accTrx.filter(t => t.tipe === 'Pemasukan').reduce((sum, t) => sum + (t.jumlah || 0), 0);
        const outTotal = accTrx.filter(t => t.tipe === 'Pengeluaran').reduce((sum, t) => sum + (t.jumlah || 0), 0);
        const expected = (acc.saldoAwal || 0) + inTotal - outTotal;
        const current = acc.saldoSaatIni || 0;

        if (expected !== current) {
          issues.push({
            type: 'SALDO_DRIFT',
            severity: 'high',
            accountId: acc.id,
            accountNama: acc.nama,
            current,
            expected,
            difference: expected - current,
            message: `Akun "${acc.nama}" mengalami selisih saldo: tercatat ${current}, seharusnya ${expected} (Selisih: ${expected - current}).`
          });
          fixesAvailable.push({ type: 'REPAIR_ACCOUNT_BALANCE', accountId: acc.id, targetBalance: expected });
        }
      });

      const categories = db.list('categories');
      const catIds = new Set(categories.map(c => c.id));
      const orphanTrx = transactions.filter(t => !catIds.has(t.categoryId));
      if (orphanTrx.length > 0) {
        issues.push({
          type: 'ORPHAN_CATEGORIES',
          severity: 'medium',
          count: orphanTrx.length,
          message: `Ditemukan ${orphanTrx.length} transaksi yang menggunakan ID kategori yang sudah tidak ada di master kategori.`
        });
        fixesAvailable.push({ type: 'REASSIGN_ORPHAN_CATEGORIES', count: orphanTrx.length });
      }

      const residents = db.list('residents');
      const resIds = new Set(residents.map(r => r.id));
      const bills = db.list('duesBills');
      const orphanBills = bills.filter(b => !resIds.has(b.residentId));
      if (orphanBills.length > 0) {
        issues.push({
          type: 'ORPHAN_BILLS',
          severity: 'medium',
          count: orphanBills.length,
          message: `Ditemukan ${orphanBills.length} tagihan iuran yang merujuk ke warga yang sudah terhapus.`
        });
      }

      return {
        healthy: issues.length === 0,
        totalIssues: issues.length,
        issues,
        fixesAvailable
      };
    },

    async autoRepair() {
      const scan = this.scanIntegrity();
      const repairsDone = [];
      const db = window.KasRT.DB;

      for (const fix of scan.fixesAvailable) {
        if (fix.type === 'REPAIR_ACCOUNT_BALANCE') {
          await db.update('cashAccounts', fix.accountId, {
            saldoSaatIni: fix.targetBalance
          });
          repairsDone.push(`Saldo akun ${fix.accountId} diselaraskan ke Rp ${fix.targetBalance}`);
        } else if (fix.type === 'REASSIGN_ORPHAN_CATEGORIES') {
          const fallbackCat = db.list('categories')[0] || { id: 'CAT-IN-005', nama: 'Lain-lain' };
          const allTrx = db.list('transactions');
          const catIds = new Set(db.list('categories').map(c => c.id));
          for (const t of allTrx) {
            if (!catIds.has(t.categoryId)) {
              await db.update('transactions', t.id, {
                categoryId: fallbackCat.id,
                categoryNameSnapshot: fallbackCat.nama
              });
            }
          }
          repairsDone.push(`Kategori yatim pada transaksi dialihkan ke "${fallbackCat.nama}"`);
        }
      }

      return {
        success: true,
        repairsCount: repairsDone.length,
        repairsDone
      };
    }
  };

  window.KasRT = window.KasRT || {};
  window.KasRT.Features = window.KasRT.Features || {};
  window.KasRT.Features.Health = HealthFeature;
  window.KasRT_Features_Health_Loaded = true;
})();
