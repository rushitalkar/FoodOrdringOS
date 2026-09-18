import cron from 'node-cron';
import KOT from '../models/KOT.js';

export const initKotCronJob = () => {
  // Cron running every hour: '0 * * * *'
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Checking for delayed KOT orders (> 30 mins)...');
    try {
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

      const delayedKOTs = await KOT.find({
        status: { $in: ['pending', 'preparing'] },
        createdAt: { $lt: thirtyMinsAgo }
      }).populate('tableId');

      if (delayedKOTs.length > 0) {
        console.warn(`[KITCHEN ALERT] ${delayedKOTs.length} KOT orders are delayed past 30 minutes!`);
      }
    } catch (err) {
      console.error('[CRON ERROR]', err.message);
    }
  });
};