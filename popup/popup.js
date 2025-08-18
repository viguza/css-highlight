document.addEventListener('DOMContentLoaded', function() {
  // Initialize opacity display and range input styling
  const opacityInput = document.getElementById('opacityInput');
  const opacityValue = document.getElementById('opacityValue');

  function updateOpacityRange() {
    const value = opacityInput.value;
    const percentage = Math.round(value * 100);
    opacityValue.textContent = percentage + '%';

    // Update the range input's visual fill
    const fillPercentage = (value - opacityInput.min) / (opacityInput.max - opacityInput.min) * 100;
    opacityInput.style.setProperty('--fill-percentage', fillPercentage + '%');
  }

  opacityInput.addEventListener('input', updateOpacityRange);

  // Initialize the range input fill on page load
  updateOpacityRange();

  // Initialize collapsible functionality
  const collapseToggle = document.getElementById('collapseToggle');
  const highlightOptions = document.getElementById('highlightOptions');
  const toggleText = collapseToggle.querySelector('.toggle-text');
  const toggleIcon = collapseToggle.querySelector('.toggle-icon');

  collapseToggle.addEventListener('click', function() {
    const isHidden = highlightOptions.style.display === 'none';

    if (isHidden) {
      highlightOptions.style.display = 'block';
      toggleText.textContent = 'Hide Advanced Options';
      toggleIcon.textContent = '▲';
    } else {
      highlightOptions.style.display = 'none';
      toggleText.textContent = 'Show Advanced Options';
      toggleIcon.textContent = '▼';
    }
  });

  // Element navigation variables
  let currentElementIndex = 0;
  let foundElements = [];

  // Navigation button event listeners
  document.getElementById('prevElement').addEventListener('click', function() {
    if (foundElements.length > 0) {
      currentElementIndex = (currentElementIndex - 1 + foundElements.length) % foundElements.length;
      updateElementInfo();
      highlightCurrentElement();
    }
  });

  document.getElementById('nextElement').addEventListener('click', function() {
    if (foundElements.length > 0) {
      currentElementIndex = (currentElementIndex + 1) % foundElements.length;
      updateElementInfo();
      highlightCurrentElement();
    }
  });

  function updateElementInfo() {
    if (foundElements.length === 0) {
      document.getElementById('elementInfo').style.display = 'none';
      return;
    }

    const element = foundElements[currentElementIndex];
    const elementInfo = document.getElementById('elementInfo');
    const elementCount = document.getElementById('elementCount');
    const currentIndex = document.getElementById('currentElementIndex');
    const elementTag = document.getElementById('elementTag');
    const elementId = document.getElementById('elementId');

    // Show element info section
    elementInfo.style.display = 'block';

    // Update counts and navigation
    elementCount.textContent = `${foundElements.length} element${foundElements.length !== 1 ? 's' : ''} found`;
    currentIndex.textContent = `${currentElementIndex + 1} of ${foundElements.length}`;

    // Update element details using serialized data
    elementTag.textContent = element.tagName || 'unknown';
    elementId.textContent = element.id || 'none';
  }

  function navigateToElement(selector, pathIndex) {
    // Since we don't have direct DOM access, we'll just scroll to the current element
    // and provide visual feedback
    if (foundElements[currentElementIndex]) {
      const currentElement = foundElements[currentElementIndex];

      // Send message to content script to scroll to and highlight this element
      chrome.runtime.sendMessage({
        name: 'scrollToElement',
        index: currentElementIndex
      });
    }
  }

  function highlightCurrentElement() {
    // Send message to content script to highlight the current element
    if (foundElements.length > 0) {
      chrome.runtime.sendMessage({
        name: 'highlightCurrentElement',
        index: currentElementIndex
      });
    }
  }

  document.getElementById('highlightButton').addEventListener('click', function(event) {
    event.preventDefault();

    var searchType = document.getElementById('searchType').value;
    var identifier = document.getElementById('identifierInput').value;
    var color = document.getElementById('colorInput').value;
    var highlightStyle = document.getElementById('highlightStyle').value;
    var opacity = document.getElementById('opacityInput').value;
    var textColor = document.getElementById('textColorInput').value;
    var changeTextColor = document.getElementById('changeTextColor').checked;

    if (identifier !== '') {
      chrome.runtime.sendMessage({
        name: 'highlight',
        searchType: searchType,
        identifier: identifier,
        color: color,
        highlightStyle: highlightStyle,
        opacity: opacity,
        textColor: textColor,
        changeTextColor: changeTextColor
      });
    }
  });

  document.getElementById('resetButton').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('searchType').value = 'both';
    document.getElementById('identifierInput').value = '';
    document.getElementById('colorInput').value = '#ffdc00';
    document.getElementById('highlightStyle').value = 'background';
    document.getElementById('opacityInput').value = '1';
    document.getElementById('textColorInput').value = '#000000';
    document.getElementById('changeTextColor').checked = false;

    // Reset element info
    foundElements = [];
    currentElementIndex = 0;
    document.getElementById('elementInfo').style.display = 'none';

    // Update the range input fill after reset
    updateOpacityRange();

    chrome.runtime.sendMessage({
      name: 'reset',
    });
  });

  // Listen for messages from content script about found elements
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.name === 'elementsFound') {
      foundElements = message.elements;
      currentElementIndex = 0;
      updateElementInfo();
      if (foundElements.length > 0) {
        highlightCurrentElement();
      }
    }
  });
});
