import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROCESSED_DIR = path.join(__dirname, '../../output/processed');

const REQUIRED_FIELDS = ["id", "topic", "nodes", "page_number"];

const validateFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let json;
    let modified = false;

    // 1. Auto-Repair: Remove Markdown code blocks
    if (content.includes('```json')) {
        console.log(`🔧 Auto-repairing Markdown in ${path.basename(filePath)}`);
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        modified = true;
    }

    try {
        json = JSON.parse(content);
    } catch (e) {
        console.error(`❌ Invalid JSON in ${path.basename(filePath)}:`, e.message);
        return false;
    }

    // 2. Schema Check
    for (const field of REQUIRED_FIELDS) {
        if (!json[field]) {
            console.error(`❌ Missing field '${field}' in ${path.basename(filePath)}`);
            return false;
        }
    }

    // 3. Save if modified
    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
        console.log(`💾 Saved repaired file: ${path.basename(filePath)}`);
    }

    return true;
};

const main = () => {
    if (!fs.existsSync(PROCESSED_DIR)) {
        console.error(`❌ Processed directory not found: ${PROCESSED_DIR}`);
        return;
    }

    const chapters = fs.readdirSync(PROCESSED_DIR);
    let totalFiles = 0;
    let validFiles = 0;

    for (const chapter of chapters) {
        const chapterPath = path.join(PROCESSED_DIR, chapter);
        if (!fs.statSync(chapterPath).isDirectory()) continue;

        const files = fs.readdirSync(chapterPath).filter(f => f.endsWith('.json'));

        for (const file of files) {
            totalFiles++;
            if (validateFile(path.join(chapterPath, file))) {
                validFiles++;
            }
        }
    }

    console.log(`🔍 Validation Complete: ${validFiles}/${totalFiles} valid.`);
};

main();
