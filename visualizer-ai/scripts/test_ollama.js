const fs = require('fs');

async function test() {
    console.log("1. Checking fetch...");
    if (typeof fetch === 'undefined') {
        console.error("❌ fetch is NOT defined. Node version might be too old.");
    } else {
        console.log("✅ fetch is defined.");
    }

    console.log("2. Checking Ollama...");
    try {
        const response = await fetch("http://localhost:11434/api/tags");
        if (response.ok) {
            console.log("✅ Ollama is reachable.");
            const data = await response.json();
            console.log("Models:", data.models.map(m => m.name));
        } else {
            console.error("❌ Ollama returned status:", response.status);
        }
    } catch (e) {
        console.error("❌ Ollama connection failed:", e.message);
    }

    console.log("3. Checking Write...");
    try {
        fs.writeFileSync('test_write.txt', 'test');
        console.log("✅ Write successful.");
        fs.unlinkSync('test_write.txt');
    } catch (e) {
        console.error("❌ Write failed:", e);
    }
}

test();
