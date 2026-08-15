import cron from 'node-cron';
import Document from '../models/Document.js';

export const startCronJobs = () => {
    // Runs every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        try {
            // Find documents stuck in 'processing' for more than 15 minutes
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            
            const stuckDocuments = await Document.find({
                status: 'processing',
                updatedAt: { $lt: fifteenMinutesAgo }
            });

            if (stuckDocuments.length === 0) return;

            console.warn(`[Cron] Found ${stuckDocuments.length} ghost documents. Resetting to 'failed'...`);

            for (const doc of stuckDocuments) {
                doc.status = 'failed';
                doc.errorReason = 'Processing timed out. Please delete and try uploading again.';
                await doc.save();
            }
        } catch (error) {
            console.error('[Cron] Error sweeping stuck documents:', error);
        }
    });
    
    console.log('[System] Background cron jobs initialized.');
};