const fs = require('fs');
const path = require('path');
let pdf = require('pdf-parse');
if (pdf.default) {
    pdf = pdf.default;
}

const CONTENT_DIR = path.join(__dirname, '../../content');
const OUTPUT_FILE = path.join(__dirname, '../firestore_import.json');

// Heuristic: 1 Page = 3 Steps
const STEPS_PER_PAGE = 3;

async function convertPdfToLesson(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    const fileName = path.basename(filePath);
    const topicTitle = fileName.replace('.pdf', '').replace(/CONT_.*Lecture Topic/, 'Lecture Topic').trim();

    // Simple text cleaning
    const cleanText = data.text.replace(/\n\s*\n/g, '\n').trim();

    // Better Approach for "1 page = 3 steps":
    const CHARS_PER_STEP = 700;
    const totalSteps = Math.ceil(cleanText.length / CHARS_PER_STEP);

    const steps = [];
    for (let i = 0; i < totalSteps; i++) {
        const start = i * CHARS_PER_STEP;
        const end = start + CHARS_PER_STEP;
        let chunk = cleanText.substring(start, end);

        // Try to end on a sentence
        const lastDot = chunk.lastIndexOf('.');
        if (lastDot > chunk.length - 100) {
            chunk = chunk.substring(0, lastDot + 1);
        }

        steps.push({
            type: 'explain',
            text: chunk.trim(),
            visual_html: `<div class="visual-placeholder"><h3>Visual for Part ${i + 1}</h3><p>AI should generate a diagram here based on: ${chunk.substring(0, 50)}...</p></div>`,
            levels: ['baby', 'starting', 'intermediate', 'master'] // Default to all for now
        });
    }

    const chat_responses = {
        "default": `I can help you with ${topicTitle}. Ask me about specific terms!`
    };

    return {
        id: topicTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
        topic: topicTitle,
        steps: steps,
        chat_responses: chat_responses,
        metadata: {
            source_file: fileName,
            page_count: data.numpages,
            generated_at: new Date().toISOString()
        }
    };
}

async function main() {
    console.log("🚀 Starting Content Conversion Engine...");
    console.log("📂 Content Directory:", CONTENT_DIR);
    console.log("📂 Resolved Path:", path.resolve(CONTENT_DIR));

    if (!fs.existsSync(CONTENT_DIR)) {
        console.error("❌ Content directory does not exist!");
        return;
    }

    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.pdf'));
    console.log(`📄 Found ${files.length} PDF files.`);
    const database = {};

    for (const file of files) {
        console.log(`Processing: ${file}`);
        try {
            const fullPath = path.join(CONTENT_DIR, file);
            console.log(`Reading file at: ${fullPath}`);
            const lesson = await convertPdfToLesson(fullPath);
            console.log(`Generated lesson ID: ${lesson.id} with ${lesson.steps.length} steps.`);
            database[lesson.id] = lesson;
        } catch (e) {
            console.error(`❌ Error converting ${file}:`, e);
            fs.appendFileSync(path.join(__dirname, '../conversion_errors.txt'), `Error converting ${file}: ${e.message}\n${e.stack}\n\n`);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(database, null, 2));
    console.log(`✅ Conversion Complete! Database saved to ${OUTPUT_FILE}`);
}

main();
