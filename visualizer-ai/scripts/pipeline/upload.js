import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROCESSED_DIR = path.join(__dirname, '../../output/processed');
const JS_OUTPUT_FILE = path.join(__dirname, '../../js/converted_data_pipeline.js');

const main = async () => {
    if (!fs.existsSync(PROCESSED_DIR)) {
        console.error(`❌ Processed directory not found: ${PROCESSED_DIR}`);
        return;
    }

    const chapters = fs.readdirSync(PROCESSED_DIR);
    const database = {};

    console.log(`📦 Aggregating content from ${chapters.length} chapters...`);

    for (const chapter of chapters) {
        const chapterPath = path.join(PROCESSED_DIR, chapter);
        if (!fs.statSync(chapterPath).isDirectory()) continue;

        const files = fs.readdirSync(chapterPath)
            .filter(f => f.endsWith('.json'))
            .sort((a, b) => {
                // Sort by page number
                const numA = parseInt(a.match(/page-(\d+)/)[1]);
                const numB = parseInt(b.match(/page-(\d+)/)[1]);
                return numA - numB;
            });

        if (files.length === 0) continue;

        // Initialize Lesson Object
        // We take metadata from the first page
        const firstPage = JSON.parse(fs.readFileSync(path.join(chapterPath, files[0]), 'utf8'));

        const lesson = {
            id: firstPage.id,
            topic: firstPage.topic,
            chat_responses: firstPage.chat_responses || {},
            steps: []
        };

        // Aggregate Steps
        for (const file of files) {
            const pageData = JSON.parse(fs.readFileSync(path.join(chapterPath, file), 'utf8'));
            if (pageData.nodes && Array.isArray(pageData.nodes)) {
                lesson.steps.push(...pageData.nodes);
            }
        }

        database[lesson.id] = lesson;
        console.log(`✅ Aggregated ${lesson.id} (${lesson.steps.length} steps)`);
    }

    // Write JS File for Client (Local Dev)
    const jsContent = `window.CONVERTED_DATA = ${JSON.stringify(database, null, 2)};`;
    fs.writeFileSync(JS_OUTPUT_FILE, jsContent);
    console.log(`✅ Generated local data file: ${JS_OUTPUT_FILE}`);

    // NOTE: Actual Firestore upload would go here using the Firebase Admin SDK or Client SDK.
    // For now, we are generating the JS file which the App can also use or upload via the existing App.uploadToFirestore()
    console.log(`🚀 Ready for upload! Open the App and run App.uploadToFirestore() to push this data.`);
};

main();
