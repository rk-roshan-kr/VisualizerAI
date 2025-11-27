const fs = require('fs');
const path = require('path');

const JSON_FILE = path.join(__dirname, '../firestore_import.json');
const JS_FILE = path.join(__dirname, '../js/converted_data.js');

const data = fs.readFileSync(JSON_FILE, 'utf8');
const jsContent = `window.CONVERTED_DATA = ${data};`;

fs.writeFileSync(JS_FILE, jsContent);
console.log(`✅ Converted JSON to JS: ${JS_FILE}`);
