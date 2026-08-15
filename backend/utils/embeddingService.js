import { Worker } from 'worker_threads';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

// ES6 trick to get __dirname in modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Spin up the worker exactly once when the server boots
const worker = new Worker(path.join(__dirname, 'embeddingWorker.js'));
const pendingJobs = new Map();

// Listen for finished jobs coming from the background thread
worker.on('message', ({ jobId, success, data, error }) => {
    const job = pendingJobs.get(jobId);
    if (!job) return;
    
    if (success) {
        job.resolve(data);
    } else {
        console.error(`[Vector Engine] Job ${jobId} failed:`, error);
        job.reject(new Error(error));
    }
    
    pendingJobs.delete(jobId); // Clean up memory
});

/**
 * @param {Array} textArray - Array of text chunks to vectorize
 * @returns {Promise<Array>} - Array of 384-dimension vectors
 */
export const generateEmbeddings = (textArray) => {
    return new Promise((resolve, reject) => {
        const jobId = randomUUID();
        pendingJobs.set(jobId, { resolve, reject });
        
        // Fire and forget - send the heavy math to the background thread
        worker.postMessage({ jobId, chunks: textArray });
    });
};