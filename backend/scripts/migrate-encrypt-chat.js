/**
 * One-time migration script to encrypt existing plaintext chat messages.
 * 
 * Usage: node scripts/migrate-encrypt-chat.js
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Fetches all ChatHistory documents
 * 3. Encrypts any plaintext message content using AES-256-GCM
 * 4. Skips messages that are already encrypted
 * 5. Reports stats on completion
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { encrypt, isEncrypted } from '../utils/encryption.js';

const MONGODB_URL = process.env.MONGODB_URL;

async function migrate() {
    console.log('🔐 Chat History Encryption Migration');
    console.log('=====================================\n');

    // 1. Connect to MongoDB
    try {
        await mongoose.connect(MONGODB_URL);
        console.log('✅ Connected to MongoDB\n');
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }

    // 2. Access the ChatHistory collection directly (bypass Mongoose hooks)
    const collection = mongoose.connection.collection('chathistories');
    const cursor = collection.find({});
    const allDocs = await cursor.toArray();

    console.log(`📄 Found ${allDocs.length} chat history document(s)\n`);

    let totalDocsModified = 0;
    let totalMessagesEncrypted = 0;
    let totalMessagesSkipped = 0;

    // 3. Process each document
    for (const doc of allDocs) {
        if (!doc.messages || doc.messages.length === 0) continue;

        let modified = false;

        for (const msg of doc.messages) {
            if (msg.content && !isEncrypted(msg.content)) {
                msg.content = encrypt(msg.content);
                totalMessagesEncrypted++;
                modified = true;
            } else {
                totalMessagesSkipped++;
            }
        }

        // 4. Save back to DB if any messages were encrypted
        if (modified) {
            await collection.updateOne(
                { _id: doc._id },
                { $set: { messages: doc.messages } }
            );
            totalDocsModified++;
        }
    }

    // 5. Report results
    console.log('=====================================');
    console.log('📊 Migration Complete!\n');
    console.log(`   Documents processed:    ${allDocs.length}`);
    console.log(`   Documents modified:     ${totalDocsModified}`);
    console.log(`   Messages encrypted:     ${totalMessagesEncrypted}`);
    console.log(`   Messages skipped:       ${totalMessagesSkipped} (already encrypted)`);
    console.log('\n✅ All done! Your chat history is now encrypted at rest.');

    await mongoose.disconnect();
    process.exit(0);
}

migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
