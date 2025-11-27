const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfPath = path.join(__dirname, '../../content/CHAPTER-1 (UNIT-3).pdf');

async function testPdf() {
    console.log("Testing PDF Parse on:", pdfPath);
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        console.log("✅ PDF Parsed Successfully!");
        console.log("Text length:", data.text.length);
        console.log("Preview:", data.text.substring(0, 200));
    } catch (e) {
        console.error("❌ PDF Parse Failed:", e);
    }
}

testPdf();
