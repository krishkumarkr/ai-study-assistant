
export const pickSpreadChunks = (chunks, k = 6) => {
    if (!Array.isArray(chunks) || chunks.length === 0) return [];
    if (chunks.length <= k) return chunks;
    const step = chunks.length / k;
    const offset = Math.random(); // a different spot in each section every time
    return Array.from({ length: k }, (_, i) =>
        chunks[Math.min(chunks.length - 1, Math.floor((i + offset) * step))]
    );
};

export const buildSampleText = (chunks, k = 6, maxChars = 16000) => {
    const perChunk = Math.floor(maxChars / k);
    return pickSpreadChunks(chunks, k)
        .map(c => c.content.slice(0, perChunk))
        .join('\n\n');
};