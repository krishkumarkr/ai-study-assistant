import { parentPort } from 'worker_threads';
import fetch from 'node-fetch'; 

// 🛡️ THE NETWORK PATCH: Overwrite Node's native fetch with node-fetch
global.fetch = fetch;

import { pipeline, env } from '@huggingface/transformers';

// Configuration to prevent cache corruption
env.allowLocalModels = true;
env.useBrowserCache = false;

class Embedder {
    static instance = null;
    static async getInstance() {
        if (!this.instance) {
            let retries = 3;
            while (retries > 0) {
                try {
                    console.log(`[Worker] Attempting to connect to Hugging Face CDN...`);
                    // all-MiniLM-L6-v2 is the industry standard for fast, accurate text embeddings
                    this.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
                    console.log(`[Worker] AI Model successfully downloaded and cached!`);
                    break;
                } catch (err) {
                    retries--;
                    console.warn(`[Worker] Network drop. Retries left: ${retries}. Error: ${err.message}`);
                    if (retries === 0) throw err;
                    // Wait 3 seconds before hammering the CDN again
                    await new Promise(res => setTimeout(res, 3000));
                }
            }
        }
        return this.instance;
    }
}

// Listen for jobs from the main API thread
parentPort.on('message', async ({ jobId, chunks }) => {
    try {
        const extractor = await Embedder.getInstance();
        const results = [];
        
        // Used a standard for-loop to prevent memory spiking
        for (const text of chunks) {
            // pooling: 'mean' and normalize: true are REQUIRED for MongoDB Cosine Similarity
            const output = await extractor(text, { pooling: 'mean', normalize: true });
            results.push(Array.from(output.data)); 
        }
        
        // Send the finished vectors back to the main thread
        parentPort.postMessage({ jobId, success: true, data: results });
    } catch (error) {
        parentPort.postMessage({ jobId, success: false, error: error.message });
    }
});