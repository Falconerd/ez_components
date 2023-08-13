const grugComponents = require('./index.js');

const inputHtml = '<my-component name="Alice"></my-component>';
const processedHtml = grugComponents.compileHtml(inputHtml);
const processedFileHtml = grugComponents.compileHtmlFromFile('./test.html');

console.log('Processed HTML:', processedHtml);
console.log('Processed File HTML:', processedFileHtml);
