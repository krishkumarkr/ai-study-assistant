import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// We keep this null initially
let s3Client = null;

// This function only runs when an upload or delete is actually requested
const getS3Client = () => {
    if (!s3Client) {
        // By the time this runs, dotenv has absolutely finished loading!
        s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });
    }
    return s3Client;
};

/**
 * Uploads a file buffer directly to Cloudflare R2
 */
export const uploadToR2 = async (fileBuffer, originalName, mimeType) => {
    const client = getS3Client(); // Get the guaranteed-loaded client

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const uniqueFileName = `${uniqueSuffix}-${originalName.replace(/\s+/g, '-')}`;

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: mimeType,
    });

    await client.send(command);

    return `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`;
};

/**
 * Deletes an object from Cloudflare R2 by its file name (Key)
 */
export const deleteFromR2 = async (fileName) => {
    const client = getS3Client(); // Get the guaranteed-loaded client
    
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
    });
    
    await client.send(command);
};