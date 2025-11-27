import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up one level from 'scripts' to root, then into 'output/raw/chapter_1__unit_3_'
const INPUT_DIR = path.resolve(__dirname, '../output/raw/chapter_1__unit_3_');
const OUTPUT_DIR = path.resolve(__dirname, '../output/journeys');
const PROMPT_FILE = path.resolve(__dirname, '../config/page_prompt.txt');

// API Key (In production, use process.env.GEMINI_API_KEY)
const API_KEY = "AIzaSyCD9FJdKV789CoJzehHAjDOpBpLbc2JevU";

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function generatePage(filePath) {
    const fileName = path.basename(filePath);
    const match = fileName.match(/page-(\d+)/);
    if (!match) {
        console.error(`Skipping invalid file: ${fileName}`);
        return;
    }
    const pageNum = match[1];
    const outputFile = path.join(OUTPUT_DIR, `journey_page_${pageNum}.json`);

    if (fs.existsSync(outputFile)) {
        console.log(`Skipping Page ${pageNum} (Already exists)`);
        return;
    }

    console.log(`Processing Page ${pageNum}...`);
    const text = fs.readFileSync(filePath, 'utf-8');
    let promptTemplate = fs.readFileSync(PROMPT_FILE, 'utf-8');

    const prompt = promptTemplate
        .replace(/{{PAGE_TEXT}}/g, text)
        .replace(/{{PAGE_NUMBER}}/g, pageNum);

    const jsonStr = await callGemini(prompt);

    if (jsonStr) {
        try {
            // Clean up markdown code blocks if present
            const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            JSON.parse(cleanJson); // Validate JSON
            fs.writeFileSync(outputFile, cleanJson);
            console.log(`✅ Generated Page ${pageNum}`);
        } catch (e) {
            console.error(`❌ Invalid JSON for Page ${pageNum}:`, e.message);
        }
    } else {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(file => generatePage(path.join(INPUT_DIR, file))));
    }
} catch (error) {
    console.error("Error in main:", error);
}
}

main();
