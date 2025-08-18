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

  // Advanced search functionality
  const searchType = document.getElementById('searchType');
  const advancedSearchOptions = document.getElementById('advancedSearchOptions');
  const basicInputSection = document.getElementById('basicInputSection');
  const cssSelectorGroup = document.getElementById('cssSelectorGroup');
  const attributeGroup = document.getElementById('attributeGroup');
  const textContentGroup = document.getElementById('textContentGroup');
  const identifierInput = document.getElementById('identifierInput');
  const colorInput = document.getElementById('colorInput');
  const colorInputAdvanced = document.getElementById('colorInputAdvanced');

  // Synchronize color pickers
  function syncColorPickers() {
    colorInput.addEventListener('input', function() {
      colorInputAdvanced.value = this.value;
    });
    
    colorInputAdvanced.addEventListener('input', function() {
      colorInput.value = this.value;
    });
  }

  // Initialize color picker synchronization
  syncColorPickers();

  function updateSearchOptions() {
    const selectedType = searchType.value;

    // Hide all advanced options first
    cssSelectorGroup.style.display = 'none';
    attributeGroup.style.display = 'none';
    textContentGroup.style.display = 'none';
    advancedSearchOptions.style.display = 'none';
    basicInputSection.style.display = 'none';

    // Show appropriate input section
    switch (selectedType) {
      case 'css-selector':
        advancedSearchOptions.style.display = 'block';
        cssSelectorGroup.style.display = 'block';
        break;
      case 'attribute':
        advancedSearchOptions.style.display = 'block';
        attributeGroup.style.display = 'block';
        break;
      case 'text-content':
        advancedSearchOptions.style.display = 'block';
        textContentGroup.style.display = 'block';
        break;
      default:
        // class, id - use basic input section
        basicInputSection.style.display = 'block';
        updateBasicExamples(selectedType);
        break;
    }
  }

  function updateBasicExamples(searchType) {
    const basicExamples = document.getElementById('basicExamples');
    let examples = '';
    
    if (searchType === 'class') {
      examples = 'Examples: <code>.button</code>, <code>.nav-item</code>, <code>.container</code>';
    } else if (searchType === 'id') {
      examples = 'Examples: <code>#header</code>, <code>#main-content</code>, <code>#sidebar</code>';
    }
    
    basicExamples.innerHTML = `<small>${examples}</small>`;
  }

  // Initialize search options
  updateSearchOptions();

  // Update search options when type changes
  searchType.addEventListener('change', updateSearchOptions);

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

    var searchTypeValue = searchType.value;
    var identifier = '';
    var color = '';
    var highlightStyle = document.getElementById('highlightStyle').value;
    var opacity = document.getElementById('opacityInput').value;
    var textColor = document.getElementById('textColorInput').value;
    var changeTextColor = document.getElementById('changeTextColor').checked;

    // Get color from appropriate input based on search type
    if (searchTypeValue === 'class' || searchTypeValue === 'id') {
      color = colorInput.value;
    } else {
      color = colorInputAdvanced.value;
    }

    // Get identifier based on search type
    switch (searchTypeValue) {
      case 'css-selector':
        identifier = document.getElementById('cssSelectorInput').value;
        break;
      case 'attribute':
        var attrName = document.getElementById('attributeName').value;
        var attrValue = document.getElementById('attributeValue').value;
        identifier = attrValue ? `${attrName}="${attrValue}"` : attrName;
        break;
      case 'text-content':
        var textToFind = document.getElementById('textContentInput').value;
        var caseSensitive = document.getElementById('caseSensitive').checked;
        var partialMatch = document.getElementById('partialMatch').checked;
        identifier = JSON.stringify({
          text: textToFind,
          caseSensitive: caseSensitive,
          partialMatch: partialMatch
        });
        break;
      default:
        identifier = document.getElementById('identifierInput').value;
        break;
    }

    if (identifier !== '') {
      chrome.runtime.sendMessage({
        name: 'highlight',
        searchType: searchTypeValue,
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
    document.getElementById('searchType').value = 'class';
    document.getElementById('identifierInput').value = '';
    document.getElementById('cssSelectorInput').value = '';
    document.getElementById('attributeName').value = '';
    document.getElementById('attributeValue').value = '';
    document.getElementById('textContentInput').value = '';
    document.getElementById('caseSensitive').checked = false;
    document.getElementById('partialMatch').checked = false;
    
    // Reset both color pickers to the same value
    const defaultColor = '#ffdc00';
    colorInput.value = defaultColor;
    colorInputAdvanced.value = defaultColor;
    
    document.getElementById('highlightStyle').value = 'background';
    document.getElementById('opacityInput').value = '1';
    document.getElementById('textColorInput').value = '#000000';
    document.getElementById('changeTextColor').checked = false;

    // Reset search options display
    updateSearchOptions();

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
