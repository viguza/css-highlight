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
      highlight(message.searchType, message.identifier, message.color);
    }
    if(message.name === 'reset') {
      reset();
    }
  } catch (error) {
    console.error('Error in message listener:', error);
    showErrorMessage();
  }
});

function highlight(type, identifier, color) {
  try {
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
      const found = originalElements.some(el => el.object === element)
      if (!found) {
        originalElements.push({object: element, color: element.style.backgroundColor});
      }
      element.style.backgroundColor = color;
    }
  } catch (error) {
    console.error('Error in highlight function:', error);
    showErrorMessage();
  }
}

function reset() {
  try {
    for (var i = 0; i < originalElements.length; i++) {
      let element = originalElements[i];
      if (element.object) {
        element.object.style.backgroundColor = element.color;
      }
    }
    originalElements = [];
  } catch (error) {
    console.error('Error in reset function:', error);
    showErrorMessage();
  }
}
