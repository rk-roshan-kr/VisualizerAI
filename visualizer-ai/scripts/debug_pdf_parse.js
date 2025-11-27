const pdf = require('pdf-parse');
console.log("Type of pdf:", typeof pdf);
console.log("Value of pdf:", pdf);
console.log("Keys:", Object.keys(pdf));
if (pdf.default) {
    console.log("pdf.default type:", typeof pdf.default);
}
// Check if any key is a function
for (const key of Object.keys(pdf)) {
    if (typeof pdf[key] === 'function') {
        console.log(`pdf.${key} is a function`);
    }
}
