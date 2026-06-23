import { PDFParse } from "pdf-parse";

/**
 * Extract text directly from a PDF file buffer sitting in RAM
 * @param {Buffer} fileBuffer - The raw file buffer from multer (req.file.buffer)
 * @returns {Promise<{text: string, numPages: number}>}
 */
export const extractTextFromPDF = async (fileBuffer) => {
    try {
        // pdf-parse expects a Uint8Array, we convert the RAM buffer straight into it
        const parser = new PDFParse(new Uint8Array(fileBuffer));
        const data = await parser.getText();

        return {
            text: data.text,
            numPages: data.numPages,
            info: data.info,
        };
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error("Failed to extract text from PDF");
    }
};