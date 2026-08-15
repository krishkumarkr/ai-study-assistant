import { pipeline } from '@huggingface/transformers';
console.log("Pre-downloading embedding model for Docker image...");
await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
console.log("Model cached successfully.");
process.exit(0);