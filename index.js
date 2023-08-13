#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const pretty = require('pretty');
const { JSDOM } = jsdom;

console.time('Processing Time');

const standardHtmlTags = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"]

function processFile(filePath) {
  fs.readFile(filePath, 'utf8', function (err, fileData) {
    if (err) {
      console.error('Error reading file:', filePath, err);
      return;
    }

    const modifiedData = fileData.replace(/<([\w-]+)([^>]*)\/>/g, '<$1$2></$1>');

    const dom = new JSDOM(modifiedData);
    const document = dom.window.document;
    const components = Array.from(document.body.getElementsByTagName('*')).filter(element => !standardHtmlTags.includes(element.tagName.toLowerCase()));

    const processNextComponent = (index) => {
      if (index >= components.length) {
        const formattedHtml = pretty(dom.serialize());
        const outputPath = path.join('build', filePath.substring(4));
        const dir = path.dirname(outputPath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFile(outputPath, formattedHtml, function (err) {
          if (err) {
            console.error('Error writing compiled file:', outputPath, err);
            return;
          }
          console.log('Compiled file written successfully:', outputPath);
        });
        return;
      }

      const component = components[index];
      const tagName = component.tagName.toLowerCase();
      const childrenContent = component.innerHTML;

      fs.readFile(`./components/${tagName}.html`, 'utf8', function (err, componentTemplate) {
        if (err) {
          console.error(`Error reading component file: ./components/${tagName}.html`, err);
          processNextComponent(index + 1);
          return;
        }

        for (const attr of component.attributes) {
          const variablePattern = new RegExp('\\{' + attr.name + '}', 'g');
          componentTemplate = componentTemplate.replace(variablePattern, attr.value);
        }

        componentTemplate = componentTemplate.replace('{children}', childrenContent);
        component.outerHTML = componentTemplate;

        processNextComponent(index + 1);
      });
    };

    processNextComponent(0);
  });
}

function processDirectory(dir) {
  fs.readdir(dir, function (err, files) {
    if (err) {
      console.error('Error reading directory:', dir, err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, function (err, stats) {
        if (err) {
          console.error('Error reading file stats:', filePath, err);
          return;
        }

        if (stats.isDirectory()) {
          processDirectory(filePath);
        } else if (path.extname(filePath) === '.html') {
          processFile(filePath);
        }
      });
    });
  });
}

processDirectory('src/');

console.timeEnd('Processing Time');
