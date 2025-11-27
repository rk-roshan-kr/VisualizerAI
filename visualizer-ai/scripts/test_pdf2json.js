const fs = require('fs');
const PDFParser = require("pdf2json");

const pdfParser = new PDFParser(this, 1);
const pdfPath = "d:/maths-test/content/CHAPTER-1 (UNIT-3).pdf";

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    const text = pdfParser.getRawTextContent();
    console.log("✅ PDF Parsed Successfully!");
    console.log("Text length:", text.length);
    console.log("Preview:", text.substring(0, 200));
});

pdfParser.loadPDF(pdfPath);
