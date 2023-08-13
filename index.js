const fs = require('fs');
const jsdom = require('jsdom');
const pretty = require('pretty');
const { JSDOM } = jsdom;

// Read the index file
fs.readFile('index.html', 'utf8', function (err, indexData) {
  if (err) {
    console.error('Error reading index file:', err);
    return;
  }

  // Use JSDOM to parse the index file
  const dom = new JSDOM(indexData);
  const document = dom.window.document;

  // Find all custom components
  const components = Array.from(document.body.getElementsByTagName('*'));

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
        const variablePattern = new RegExp('\\{' + attr.name + '\\}', 'g');
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

