import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '../../output/raw');
const OUTPUT_DIR = path.join(__dirname, '../../output/processed');
const PROMPT_TEMPLATE_PATH = path.join(__dirname, '../../config/prompt.txt');

// 🤖 OLLAMA CONFIGURATION
const OLLAMA_MODEL = "qwen2.5:7b-instruct";
const OLLAMA_API_URL = "http://localhost:11434/api/generate";

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const generateContent = async (text, topic, id, pageNum) => {
    let promptTemplate = fs.readFileSync(PROMPT_TEMPLATE_PATH, 'utf8');

    // Replace placeholders
    const prompt = promptTemplate
        .replace(/{{TOPIC}}/g, topic)
        .replace(/{{PAGE_TEXT}}/g, text)
        .replace(/{{ID}}/g, id)
        .replace(/{{PAGE_NUMBER}}/g, pageNum);

    try {
        const response = await fetch(OLLAMA_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                format: "json",
                options: {
                    num_ctx: 8192,
                    temperature: 0.1,
                    stop: ["<|im_end|>"]
                }
            })
        });
        const data = await response.json();
        return data.response;
    } catch (e) {
        console.error("❌ Ollama Error:", e);
        return null;
    }
};

const main = async () => {
    if (!fs.existsSync(INPUT_DIR)) {
        console.error(`❌ Input directory not found: ${INPUT_DIR}`);
        return;
    }

    const chapters = fs.readdirSync(INPUT_DIR);
    console.log(`🔍 Found ${chapters.length} chapters to process.`);

    for (const chapter of chapters) {
        const chapterPath = path.join(INPUT_DIR, chapter);
        if (!fs.statSync(chapterPath).isDirectory()) continue;

        const outputChapterDir = path.join(OUTPUT_DIR, chapter);
        if (!fs.existsSync(outputChapterDir)) fs.mkdirSync(outputChapterDir, { recursive: true });

        const pages = fs.readdirSync(chapterPath).filter(f => f.endsWith('.txt'));
        console.log(`📘 Processing Chapter: ${chapter} (${pages.length} pages)`);

        for (const page of pages) {
            const pageNum = page.match(/page-(\d+)\.txt/)[1];
            const outputJsonPath = path.join(outputChapterDir, `page-${pageNum}.json`);

            // Skip if already exists (resume capability)
            if (fs.existsSync(outputJsonPath)) {
                console.log(`⏩ Skipping Page ${pageNum} (Already exists)`);
                continue;
            }

            const text = fs.readFileSync(path.join(chapterPath, page), 'utf8');
            if (text.length < 50) {
                console.log(`⚠️ Skipping Page ${pageNum} (Text too short)`);
                continue;
            }

            console.log(`🧠 Generating Page ${pageNum}...`);
            const jsonContent = await generateContent(text, chapter, chapter, pageNum);

            if (jsonContent) {
                fs.writeFileSync(outputJsonPath, jsonContent);
                console.log(`✅ Saved Page ${pageNum}`);
            } else {
                console.error(`❌ Failed to generate Page ${pageNum}`);
            }
        }
    }
    console.log("✅ Generation Complete");
};

main();
