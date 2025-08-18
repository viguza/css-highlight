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
  } catch (error) {
    console.error('Error in message listener:', error);
    showErrorMessage();
  }
});

function highlight(type, identifier, color, highlightStyle, opacity, textColor, changeTextColor) {
  try {
    let elements;

    if (type === 'class') {
      elements = document.getElementsByClassName(identifier);
    } else if (type === 'id') {
      var element = document.getElementById(identifier);
      elements = element ? [element] : [];
    } else {
      elements = document.querySelectorAll(`.${identifier},#${identifier}`);
    }

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
  } catch (error) {
    console.error('Error in reset function:', error);
    showErrorMessage();
  }
}
