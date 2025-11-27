import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFParser from 'pdf2json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '../../../content'); // Correct path to sibling dir
const OUTPUT_DIR = path.join(__dirname, '../../output/raw');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const extractPdf = (filePath, fileName) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            // Generate a clean ID for the folder
            let pdfId = "unknown_topic";
            const match = fileName.match(/Lecture Topic (\d+\.\d+\.\d+)/);
            if (match) {
                pdfId = `lecture_topic_${match[1].replace(/\./g, '_')}`;
            } else {
                pdfId = fileName.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            }

            const pdfOutputDir = path.join(OUTPUT_DIR, pdfId);
            if (!fs.existsSync(pdfOutputDir)) fs.mkdirSync(pdfOutputDir, { recursive: true });

            console.log(`📄 Processing ${fileName} -> ${pdfId} (${pdfData.Pages.length} pages)`);

            pdfData.Pages.forEach((page, index) => {
                // Extract text from page. pdf2json returns URI encoded text.
                const text = page.Texts.map(t => {
                    try {
                        return decodeURIComponent(t.R[0].T);
                    } catch (e) {
                        return t.R[0].T; // Fallback to raw text
                    }
                }).join(' ');
                fs.writeFileSync(path.join(pdfOutputDir, `page-${index + 1}.txt`), text);
            });
            resolve();
        });

        pdfParser.loadPDF(filePath);
    });
};

const main = async () => {
    if (!fs.existsSync(INPUT_DIR)) {
        console.error(`❌ Input directory not found: ${INPUT_DIR}`);
        return;
    }

    const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.pdf'));
    console.log(`🔍 Found ${files.length} PDFs to extract.`);

    for (const file of files) {
        try {
            await extractPdf(path.join(INPUT_DIR, file), file);
        } catch (e) {
            console.error(`❌ Failed to extract ${file}:`, e);
        }
    }
    console.log("✅ Extraction Complete");
};

main();
