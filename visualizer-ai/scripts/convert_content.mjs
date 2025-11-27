import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFParser from 'pdf2json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../../content');
const OUTPUT_FILE = path.join(__dirname, '../firestore_import_ollama.json');
const JS_OUTPUT_FILE = path.join(__dirname, '../js/converted_data_ollama.js');

// 🤖 OLLAMA CONFIGURATION
const OLLAMA_MODEL = "qwen2.5:7b-instruct";
const OLLAMA_API_URL = "http://localhost:11434/api/generate";

async function askOllama(prompt) {
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
        let rawText = data.response;
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(rawText);
    } catch (e) {
        console.error("❌ Ollama Error:", e);
        return null;
    }
}

function extractTextFromPDF(pdfPath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1);
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            resolve(pdfParser.getRawTextContent());
        });
        pdfParser.loadPDF(pdfPath);
    });
}

async function convertPdfToLesson(fileName) {
    const filePath = path.join(CONTENT_DIR, fileName);
    let pdfText = "";

    try {
        console.log(`📖 Reading PDF: ${fileName}...`);
        pdfText = await extractTextFromPDF(filePath);
        // Truncate to avoid context limits (approx 3000 chars)
        pdfText = pdfText.substring(0, 3000).replace(/\s+/g, ' ');
    } catch (e) {
        console.error(`❌ Failed to read PDF ${fileName}:`, e);
        pdfText = "Content unavailable.";
    }

    // Generate ID
    let id = "unknown_topic";
    const match = fileName.match(/Lecture Topic (\d+\.\d+\.\d+)/);
    if (match) {
        id = `lecture_topic_${match[1].replace(/\./g, '_')}`;
    } else {
        id = fileName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    }
    const title = fileName.replace('.pdf', '').split('｜')[0].trim();

    console.log(`🤖 Asking Ollama to generate DEEP content for: ${title}...`);

    const prompt = `
    You are an expert Physics Tutor who makes learning ADDICTIVE. Create a GAMIFIED, INTERACTIVE journey based on the following TEXT.
    
    TOPIC: "${title}"
    SOURCE TEXT: "${pdfText}"
    
    GOAL: Make this the most interesting lesson the student has ever seen.
    
    REQUIREMENTS:
    1. Return ONLY valid JSON.
    2. The JSON must match this structure:
    {
        "id": "${id}",
        "topic": "${title}",
        "chat_responses": {
            "default": "I'm your guide for ${title}. Want to find the hidden Easter Egg? Ask me about [Secret Keyword]!",
            "[Keyword 1]": "Specific explanation...",
            "[Secret Keyword]": "🎉 You found it! [Fun Fact or Deep Insight from text]"
        },
        "steps": [
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "intro",
                "text": "HOOK: Start with a mind-blowing fact or a 'What if?' scenario based on the text. No boring intros!",
                "visual_html": "HTML string...",
                "options": ["Start Journey 🚀"]
            },
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "explain",
                "text": "STORYTELLING: Explain the core concept like a story. Use analogies (e.g., 'Voltage is like water pressure').",
                "visual_html": "HTML string...",
                "options": ["Next Chapter ▶"]
            },
            {
                "levels": ["baby", "starting"],
                "type": "quiz",
                "text": "CHALLENGE: A tricky question to test their wit.",
                "options": ["Correct Answer", "Trap Option 1", "Trap Option 2"],
                "correct_option": 0,
                "success_msg": "🌟 Brilliant! You leveled up!",
                "fail_msg": "💥 So close! Hint: [Hint from text]"
            }
        ]
    }

    VISUAL_HTML GUIDELINES:
    - Use INLINE CSS. Make it POP (Gradients, Neon effects, Emojis).
    - Intro Visual: A 'Mission Briefing' card.
    - Explain Visual: An interactive-looking diagram (use CSS shapes).
    - Dark mode compatible.
    
    Generate the JSON now.
    `;

    const generatedData = await askOllama(prompt);

    if (generatedData) {
        console.log(`✅ Ollama generated content for ${id}`);
        return { ...generatedData, id };
    } else {
        console.log(`⚠️ Ollama failed for ${id}, using fallback.`);
        return getFallbackContent(id, title);
    }
}

function getFallbackContent(id, title) {
    return {
        id: id,
        topic: title,
        chat_responses: { "default": "I can help you with this topic." },
        steps: [
            {
                levels: ["baby", "starting", "intermediate", "master"],
                type: "intro",
                text: `Welcome to **${title}**.`,
                visual_html: `<div style="padding:40px;text-align:center;"><h1>${title}</h1></div>`,
                options: ["Next ▶"]
            }
        ]
    };
}

async function main() {
    console.log(`📂 Scanning content directory: ${CONTENT_DIR}`);

    if (!fs.existsSync(CONTENT_DIR)) {
        console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
        return;
    }

    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.pdf'));
    console.log(`📄 Found ${files.length} PDF files.`);

    const database = {};

    for (const file of files) {
        try {
            const lesson = await convertPdfToLesson(file);
            database[lesson.id] = lesson;

            // Incremental Save
            console.log(`💾 Saving progress... (${Object.keys(database).length}/${files.length})`);
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(database, null, 2));
            const jsContent = `window.CONVERTED_DATA = ${JSON.stringify(database, null, 2)};`;
            fs.writeFileSync(JS_OUTPUT_FILE, jsContent);

        } catch (e) {
            console.error(`❌ Error converting ${file}:`, e);
        }
    }

    console.log(`✅ Completed! Generated ${OUTPUT_FILE}`);
}

main();
