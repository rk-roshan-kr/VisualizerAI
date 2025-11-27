import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { spawnSync, execSync } from "child_process";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_PATH = path.join(__dirname, "../../content/CHAPTER-1 (UNIT-3).pdf");
const PROMPT_TEMPLATE_PATH = path.join(__dirname, "../config/page_prompt.txt");
const OUTPUT_DIR = path.join(__dirname, "../output/journeys");

// CONFIG
const MAX_PARALLEL = Math.max(2, Math.floor(os.cpus().length / 2));
const MODEL_NAME = "qwenlms.model"; // Using our custom model

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const promptTemplate = fs.readFileSync(PROMPT_TEMPLATE_PATH, "utf8");

async function extractPageText(pdfDoc, pageNumber) {
    const page = await pdfDoc.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item) => item.str).join(" ");
    return text.replace(/\s+/g, " ").trim();
}

function cleanJson(raw) {
    return raw
        .replace(/^```json/g, "")
        .replace(/```$/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .trim();
}

function callOllamaDeep(prompt, pageNum) {
    // Reset Ollama occasionally to prevent hanging (simple approach: stop before heavy call)
    // execSync(`ollama stop ${MODEL_NAME}`, { stdio: 'ignore' }); 

    const result = spawnSync(
        "ollama",
        ["run", MODEL_NAME, "--format", "json"],
        {
            input: prompt,
            encoding: "utf-8",
            maxBuffer: 50 * 1024 * 1024
        }
    );

    if (result.status !== 0) {
        throw new Error(`Ollama failed: ${result.stderr}`);
    }

    const cleaned = cleanJson(result.stdout.trim());
    try {
        return JSON.parse(cleaned);
    } catch (err) {
        throw new Error(`JSON Parse Failed: ${cleaned.substring(0, 100)}...`);
    }
}

async function processPage(pdfDoc, pageNum) {
    const outPath = path.join(OUTPUT_DIR, `journey_page_${pageNum}.json`);

    // Skip if exists and valid
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 500) {
        console.log(`⏩ Page ${pageNum} already exists — skipping`);
        return;
    }

    const pageText = await extractPageText(pdfDoc, pageNum);
    if (!pageText || pageText.length < 50) {
        console.log(`⚠️ Skipping Page ${pageNum} (Text too short)`);
        return;
    }

    const prompt = promptTemplate
        .replace(/{{PAGE_TEXT}}/g, pageText)
        .replace(/{{PAGE_NUMBER}}/g, pageNum.toString());

    // Retry Logic
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const journey = callOllamaDeep(prompt, pageNum);

            // Quality Gate
            if (!journey.nodes || journey.nodes.length < 3) {
                throw new Error("Quality Gate Failed: < 3 nodes");
            }

            // Ensure metadata
            journey.page_number = pageNum;
            journey.journey_mode = "DEEP";

            fs.writeFileSync(outPath, JSON.stringify(journey, null, 2));
            console.log(`✅ Saved Page ${pageNum} (Attempt ${attempt})`);
            return; // Success

        } catch (e) {
            console.warn(`❌ Page ${pageNum} Attempt ${attempt} failed: ${e.message}`);
            if (attempt === 3) console.error(`💀 Give up on Page ${pageNum}`);
        }
    }
}

async function run() {
    console.log(`🚀 Starting DEEP MODE Pipeline with ${MAX_PARALLEL} workers`);
    console.log(`📄 Loading PDF: ${PDF_PATH}`);

    const pdfBytes = new Uint8Array(fs.readFileSync(PDF_PATH));
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdfDoc = await loadingTask.promise;

    console.log(`✅ PDF Loaded: ${pdfDoc.numPages} pages`);

    const queue = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) queue.push(i);

    async function worker(id) {
        while (queue.length > 0) {
            const pageNum = queue.shift();
            console.log(`⚡ Worker ${id} → Processing Page ${pageNum}`);
            await processPage(pdfDoc, pageNum);
        }
    }

    await Promise.all(
        Array.from({ length: MAX_PARALLEL }, (_, i) => worker(i + 1))
    );

    console.log("🎉 DEEP MODE Generation Complete");
}

run().catch(e => console.error(e));
