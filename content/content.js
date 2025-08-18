let originalElements = [];

// Function to display error message to user
function showErrorMessage() {
  // Remove any existing error message
  const existingError = document.getElementById('css-highlight-error');
  if (existingError) {
    existingError.remove();
  }

  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.id = 'css-highlight-error';
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    max-width: 300px;
    text-align: center;
  `;
  errorDiv.innerHTML = 'Something went wrong. Refresh page and try again.';

  // Add to page
  document.body.appendChild(errorDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

chrome.runtime.onMessage.addListener(function(message) {
  try {
    if(message.name === 'highlight') {
      highlight(message.searchType, message.identifier, message.color, message.highlightStyle, message.opacity, message.textColor, message.changeTextColor);
    }
    if(message.name === 'reset') {
      reset();
    }
    if(message.name === 'scrollToElement') {
      scrollToElement(message.index);
    }
    if(message.name === 'highlightCurrentElement') {
      highlightCurrentElement(message.index);
    }
  } catch (error) {
    console.error('Error in message listener:', error);
    showErrorMessage();
  }
});

function highlight(type, identifier, color, highlightStyle, opacity, textColor, changeTextColor) {
  try {
    let elements = [];
    
    switch (type) {
      case 'class':
        elements = Array.from(document.getElementsByClassName(identifier));
        break;
      case 'id':
        var element = document.getElementById(identifier);
        elements = element ? [element] : [];
        break;
      case 'css-selector':
        try {
          elements = Array.from(document.querySelectorAll(identifier));
        } catch (error) {
          console.error('Invalid CSS selector:', identifier);
          showErrorMessage();
          return;
        }
        break;
      case 'attribute':
        elements = findElementsByAttribute(identifier);
        break;
      case 'text-content':
        elements = findElementsByText(identifier);
        break;
      default:
        // Fallback to original behavior for 'both' and other types
        elements = Array.from(document.querySelectorAll(`.${identifier},#${identifier}`));
        break;
    }

    // Store elements for navigation
    foundElementsForNavigation = elements;

    // Send serializable element information back to popup
    const elementData = elements.map(element => ({
      tagName: element.tagName.toLowerCase(),
      className: element.className || '',
      id: element.id || '',
      position: {
        x: Math.round(element.getBoundingClientRect().left),
        y: Math.round(element.getBoundingClientRect().top)
      },
      textContent: element.textContent ? element.textContent.substring(0, 50) + (element.textContent.length > 50 ? '...' : '') : '',
      attributes: Array.from(element.attributes).map(attr => ({
        name: attr.name,
        value: attr.value
      }))
    }));

    chrome.runtime.sendMessage({
      name: 'elementsFound',
      elements: elementData
    });

    for (var i = 0; i < elements.length; i++) {
      let element = elements[i];
      const found = originalElements.some(el => el.object === element);

      if (!found) {
        // Store original styles
        const originalStyles = {
          backgroundColor: element.style.backgroundColor,
          border: element.style.border,
          outline: element.style.outline,
          textDecoration: element.style.textDecoration,
          boxShadow: element.style.boxShadow,
          color: element.style.color
        };

        originalElements.push({
          object: element,
          styles: originalStyles
        });
      }

      // Apply new highlighting based on style
      applyHighlightStyle(element, highlightStyle, color, opacity, textColor, changeTextColor);
    }
  } catch (error) {
    console.error('Error in highlight function:', error);
    showErrorMessage();
  }
}

function applyHighlightStyle(element, style, color, opacity, textColor, changeTextColor) {
  // Reset any existing highlight styles
  element.style.backgroundColor = '';
  element.style.border = '';
  element.style.outline = '';
  element.style.textDecoration = '';
  element.style.boxShadow = '';

  // Apply opacity to color
  const rgbaColor = hexToRgba(color, opacity);

  switch (style) {
    case 'background':
      element.style.backgroundColor = rgbaColor;
      break;

    case 'border':
      element.style.border = `3px solid ${rgbaColor}`;
      break;

    case 'outline':
      element.style.outline = `3px solid ${rgbaColor}`;
      element.style.outlineOffset = '2px';
      break;

    case 'underline':
      element.style.textDecoration = `underline ${rgbaColor} 3px`;
      break;

    case 'box-shadow':
      element.style.boxShadow = `0 0 0 3px ${rgbaColor}`;
      break;
  }

  // Apply text color if requested
  if (changeTextColor) {
    element.style.color = textColor;
  }
}

function hexToRgba(hex, opacity) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function reset() {
  try {
    for (var i = 0; i < originalElements.length; i++) {
      let element = originalElements[i];
      if (element.object && element.styles) {
        // Restore all original styles
        element.object.style.backgroundColor = element.styles.backgroundColor;
        element.object.style.border = element.styles.border;
        element.object.style.outline = element.styles.outline;
        element.object.style.textDecoration = element.styles.textDecoration;
        element.object.style.boxShadow = element.styles.boxShadow;
        element.object.style.color = element.styles.color;
      }
    }
    originalElements = [];

    // Clear element info in popup
    chrome.runtime.sendMessage({
      name: 'elementsFound',
      elements: []
    });
  } catch (error) {
    console.error('Error in reset function:', error);
    showErrorMessage();
  }
}

// Store found elements for navigation
let foundElementsForNavigation = [];

function scrollToElement(index) {
  if (foundElementsForNavigation[index]) {
    const element = foundElementsForNavigation[index];
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    // Highlight the element temporarily
    const originalBackground = element.style.backgroundColor;
    element.style.backgroundColor = '#ff6b6b';
    element.style.transition = 'background-color 0.3s ease';

    setTimeout(() => {
      element.style.backgroundColor = originalBackground;
      element.style.transition = '';
    }, 2000);
  }
}

function highlightCurrentElement(index) {
  // Remove previous navigation highlights
  foundElementsForNavigation.forEach(el => {
    el.style.outline = '';
    el.style.outlineOffset = '';
  });

  // Highlight current element
  if (foundElementsForNavigation[index]) {
    const currentElement = foundElementsForNavigation[index];
    currentElement.style.outline = '2px solid #007bff';
    currentElement.style.outlineOffset = '2px';

    // Scroll to element
    currentElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}

function findElementsByAttribute(attributeString) {
  let elements = [];

  try {
    if (attributeString.includes('=')) {
      // Attribute with value: data-testid="submit-button"
      const match = attributeString.match(/([^=]+)="([^"]+)"/);
      if (match) {
        const [, attrName, attrValue] = match;
        elements = Array.from(document.querySelectorAll(`[${attrName}="${attrValue}"]`));
      }
    } else {
      // Attribute without value: data-testid
      elements = Array.from(document.querySelectorAll(`[${attributeString}]`));
    }
  } catch (error) {
    console.error('Error finding elements by attribute:', error);
  }

  return elements;
}

function findElementsByText(textConfig) {
  let elements = [];

  try {
    const config = JSON.parse(textConfig);
    const searchText = config.text;
    const caseSensitive = config.caseSensitive;
    const partialMatch = config.partialMatch;

    if (!searchText) return elements;

    // Walk through all text nodes in the document
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    // Find elements containing the text
    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      const element = textNode.parentElement;

      if (element && element !== document.body) {
        let matches = false;

        if (caseSensitive) {
          matches = partialMatch ? text.includes(searchText) : text === searchText;
        } else {
          const lowerText = text.toLowerCase();
          const lowerSearch = searchText.toLowerCase();
          matches = partialMatch ? lowerText.includes(lowerSearch) : lowerText === lowerSearch;
        }

        if (matches && !elements.includes(element)) {
          elements.push(element);
        }
      }
    });
  } catch (error) {
    console.error('Error finding elements by text:', error);
  }

  return elements;
}
