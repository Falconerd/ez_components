const fs = require('fs');
const jsdom = require('jsdom');
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
      // Write the compiled HTML to a new file
      fs.writeFile('compiled.html', dom.serialize(), function (err) {
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

    // Read the corresponding component file from ./components/ directory
    fs.readFile(`./components/${tagName}.html`, 'utf8', function (err, componentData) {
      if (err) {
        console.error(`Error reading component file: ./components/${tagName}.html`, err);
        processNextComponent(index + 1);
        return;
      }

      // Use JSDOM to parse the component
      const componentDom = new JSDOM(componentData);
      let componentTemplate = componentDom.window.document.body.innerHTML;

      // Extract and replace attributes
      for (const attr of component.attributes) {
        const variablePattern = new RegExp('\\{' + attr.name + '\\}', 'g');
        componentTemplate = componentTemplate.replace(variablePattern, attr.value);
      }

      // Replace the custom component with the real component
      component.outerHTML = componentTemplate;

      processNextComponent(index + 1);
    });
  };

  processNextComponent(0);
});
