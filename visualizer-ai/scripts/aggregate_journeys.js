import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '../output/journeys');
const OUTPUT_FILE = path.join(__dirname, '../js/deep_journeys.js');

if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Input directory not found: ${INPUT_DIR}`);
    process.exit(1);
}

const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'));
const journeys = [];

console.log(`📦 Aggregating ${files.length} journey files...`);

files.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(INPUT_DIR, file), 'utf8');
        const json = JSON.parse(content);
        journeys.push(json);
    } catch (e) {
        console.error(`❌ Error parsing ${file}:`, e.message);
    }
});

// Sort by page number
journeys.sort((a, b) => a.page_number - b.page_number);

// Create a structured object: Chapter -> Pages
// Since we are processing "CHAPTER-1 (UNIT-3)", we'll hardcode the ID for now or derive it.
// For this specific task, let's map it to a specific lesson ID used in the app.
const lessonId = "chapter_1__unit_3_"; // Matches the ID in converted_data.js

const deepData = {
    [lessonId]: {
        id: lessonId,
        topic: "Semiconductor Physics (Deep Mode)",
        pages: journeys
    }
};

const jsContent = `window.DEEP_JOURNEYS = ${JSON.stringify(deepData, null, 2)};`;
fs.writeFileSync(OUTPUT_FILE, jsContent);

console.log(`✅ Aggregated content saved to ${OUTPUT_FILE}`);
console.log(`📚 Total Pages: ${journeys.length}`);
console.log(`🔗 Mapped to Lesson ID: ${lessonId}`);
