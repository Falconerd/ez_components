const fs = require('fs');
const jsdom = require('jsdom');
const pretty = require('pretty');
const { JSDOM } = jsdom;

console.time('Processing Time');
// Read the index file
fs.readFile('index.html', 'utf8', function (err, indexData) {
  if (err) {
    console.error('Error reading index file:', err);
    return;
  }

  // Replace self-closing custom component tags with equivalent opening and closing tags
  const modifiedIndexData = indexData.replace(/<([\w-]+)([^>]*)\/>/g, '<$1$2></$1>');

  // Use JSDOM to parse the modified index file
  const dom = new JSDOM(modifiedIndexData);
  const document = dom.window.document;
  const standardHtmlTags = [ "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr" ]

  // Find all custom components
  const components = Array.from(document.body.getElementsByTagName('*')).filter(element => !standardHtmlTags.includes(element.tagName.toLowerCase()));

  // Read and replace each custom component
  const processNextComponent = (index) => {
    if (index >= components.length) {
      // Format the HTML content using pretty
      const formattedHtml = pretty(dom.serialize());
      // Write the compiled HTML to a new file
      fs.writeFile('compiled.html', formattedHtml, function (err) {
        if (err) {
          console.error('Error writing compiled file:', err);
          return;
        }
        console.log('Compiled file written successfully.');
        console.timeEnd('Processing Time');
      });
      return;
    }

    const component = components[index];
    const tagName = component.tagName.toLowerCase();
    const childrenContent = component.innerHTML;

    // Read the corresponding component file from ./components/ directory
    fs.readFile(`./components/${tagName}.html`, 'utf8', function (err, componentTemplate) {
      if (err) {
        console.error(`Error reading component file: ./components/${tagName}.html`, err);
        processNextComponent(index + 1);
        return;
      }

      // Extract and replace attributes
      for (const attr of component.attributes) {
        const variablePattern = new RegExp('\\{' + attr.name + '}', 'g');
        // console.log(`Replacing attribute: ${attr.name}, value: ${attr.value}, pattern: ${variablePattern}`); // Debugging line
        componentTemplate = componentTemplate.replace(variablePattern, attr.value);
      }

      // Replace {children} placeholder with the inner HTML content
      componentTemplate = componentTemplate.replace('{children}', childrenContent);

      // Replace the custom component with the real component
      component.outerHTML = componentTemplate;

      processNextComponent(index + 1);
    });
  };

  processNextComponent(0);
});

