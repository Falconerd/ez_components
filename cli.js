#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { compileHtmlFromFile } = require('./compiler.js');

function processDirectory(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) return console.error('Error reading directory:', dir, err);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return console.error('Error reading file stats:', filePath, err);
        if (stats.isDirectory()) return processDirectory(filePath);
        if (path.extname(filePath) === '.html') {
          compileHtmlFromFile(filePath, (formattedHtml, err) => {
            if (err) return;

            const outputPath = path.join('build', filePath.substring(4));
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFile(outputPath, formattedHtml, (err) => {
              if (err) console.error('Error writing compiled file:', outputPath, err);
              else console.log('Compiled file written successfully:', outputPath);
            });
          });
        }
      });
    });
  });
}

console.time('Processing Time');
processDirectory('src/');
console.timeEnd('Processing Time');

