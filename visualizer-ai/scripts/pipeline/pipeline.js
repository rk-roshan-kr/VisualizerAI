import { execSync } from "child_process";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runScript = (scriptName) => {
    const scriptPath = path.join(__dirname, scriptName);
    console.log(`\n🚀 Running ${scriptName}...`);
    try {
        execSync(`node "${scriptPath}"`, { stdio: "inherit" });
    } catch (e) {
        console.error(`❌ Failed to run ${scriptName}`);
        process.exit(1);
    }
};

console.log("==========================================");
console.log("   VISUALIZER AI - CONTENT PIPELINE 🏭   ");
console.log("==========================================");

runScript("extract.js");
runScript("generate.js");
runScript("validate.js");
runScript("upload.js");

console.log("\n==========================================");
console.log("🎉 PIPELINE COMPLETE! Content ready.");
console.log("==========================================");
