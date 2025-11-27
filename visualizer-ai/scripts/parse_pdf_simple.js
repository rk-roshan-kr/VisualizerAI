const fs = require('fs');
const pdf = require('pdf-parse');

const file = process.argv[2];

if (!file) {
    console.error("Please provide a file path");
    process.exit(1);
}

const dataBuffer = fs.readFileSync(file);

pdf(dataBuffer).then(function (data) {
    console.log(JSON.stringify({ text: data.text }));
}).catch(function (error) {
    console.error(error);
    process.exit(1);
});
