const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../../content');
console.log("Script location:", __dirname);
console.log("Target Content Dir:", CONTENT_DIR);
console.log("Resolved Content Dir:", path.resolve(CONTENT_DIR));

try {
    if (fs.existsSync(CONTENT_DIR)) {
        console.log("✅ Directory exists.");
        const files = fs.readdirSync(CONTENT_DIR);
        console.log(`📂 Files found (${files.length}):`);
        files.forEach(f => console.log(" - " + f));
    } else {
        console.error("❌ Directory does NOT exist.");
    }
} catch (e) {
    console.error("❌ Error accessing directory:", e);
}
