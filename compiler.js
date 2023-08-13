const fs = require('fs');
const { JSDOM } = require('jsdom');
const pretty = require('pretty');

const standardHtmlTags = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"];

function compileHtml(inputHtml) {
    const modifiedData = inputHtml.replace(/<([\w-]+)([^>]*)\/>/g, '<$1$2></$1>');
    const dom = new JSDOM(modifiedData);
    const components = Array.from(dom.window.document.body.getElementsByTagName('*')).filter(element => !standardHtmlTags.includes(element.tagName.toLowerCase()));
  
    const processNextComponent = (index) => {
      if (index >= components.length) {
        return pretty(dom.window.document.body.innerHTML);
      }
  
      const component = components[index];
      const tagName = component.tagName.toLowerCase();
      const childrenContent = component.innerHTML;
  
      let componentTemplate = fs.readFileSync(`./components/${tagName}.html`, 'utf8');
      componentTemplate = [...component.attributes].reduce((template, attr) => template.replace(new RegExp(`\\{${attr.name}}`, 'g'), attr.value), componentTemplate);
  
      component.outerHTML = componentTemplate.replace('{children}', childrenContent);
      return processNextComponent(index + 1);
    };
  
    return processNextComponent(0);
  }
  
  function compileHtmlFromFile(filePath, callback) {
    fs.readFile(filePath, 'utf8', (err, fileData) => {
      if (err) {
        console.error('Error reading file:', filePath, err);
        callback(null, err);
        return;
      }
  
      const compiledHtml = compileHtml(fileData);
      callback(compiledHtml);
    });
  }
  module.exports.compileHtml = compileHtml;
  module.exports.compileHtmlFromFile = compileHtmlFromFile;