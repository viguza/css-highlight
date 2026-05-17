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
      toggleText.textContent = 'Hide advanced options';
      toggleIcon.textContent = '▲';
    } else {
      highlightOptions.style.display = 'none';
      toggleText.textContent = 'Show advanced options';
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
  const advancedColorPickers = [
    document.getElementById('colorInputCssSelector'),
    document.getElementById('colorInputAttribute'),
    document.getElementById('colorInputText')
  ];

  // Synchronize all color pickers with each other
  function syncColorPickers() {
    colorInput.addEventListener('input', function() {
      advancedColorPickers.forEach(p => { p.value = this.value; });
    });

    advancedColorPickers.forEach(picker => {
      picker.addEventListener('input', function() {
        colorInput.value = this.value;
        advancedColorPickers.forEach(p => { if (p !== this) p.value = this.value; });
      });
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

    color = colorInput.value;

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
      saveToHistory(buildHistoryEntry(searchTypeValue, identifier, color));
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
    
    // Reset all color pickers to the same value
    const defaultColor = '#ffdc00';
    colorInput.value = defaultColor;
    advancedColorPickers.forEach(p => { p.value = defaultColor; });
    
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

  document.getElementById('historyClear').addEventListener('click', function() {
    chrome.storage.local.remove(HISTORY_KEY, function() {
      renderHistory([]);
    });
  });

  loadHistory();
});

// --- History ---

const HISTORY_KEY = 'css_highlight_history';
const MAX_HISTORY = 10;

function formatTypeBadge(type) {
  return { 'class': 'cls', 'id': 'id', 'css-selector': 'css', 'attribute': 'attr', 'text-content': 'text' }[type] || type;
}

function formatHistoryLabel(entry) {
  switch (entry.searchType) {
    case 'class': return `.${entry.term}`;
    case 'id': return `#${entry.term}`;
    case 'css-selector': return entry.cssSelector;
    case 'attribute':
      return entry.attributeValue
        ? `[${entry.attributeName}="${entry.attributeValue}"]`
        : `[${entry.attributeName}]`;
    case 'text-content': {
      let label = `"${entry.text}"`;
      if (entry.caseSensitive) label += ' · Aa';
      if (entry.partialMatch) label += ' · ~';
      return label;
    }
    default: return entry.identifier;
  }
}

function buildHistoryEntry(searchTypeValue, identifier, color) {
  const entry = {
    timestamp: Date.now(),
    searchType: searchTypeValue,
    identifier: identifier,
    color: color,
    term: null,
    cssSelector: null,
    attributeName: null,
    attributeValue: null,
    text: null,
    caseSensitive: false,
    partialMatch: false,
  };

  switch (searchTypeValue) {
    case 'class':
    case 'id':
      entry.term = document.getElementById('identifierInput').value;
      break;
    case 'css-selector':
      entry.cssSelector = document.getElementById('cssSelectorInput').value;
      break;
    case 'attribute':
      entry.attributeName = document.getElementById('attributeName').value;
      entry.attributeValue = document.getElementById('attributeValue').value;
      break;
    case 'text-content':
      entry.text = document.getElementById('textContentInput').value;
      entry.caseSensitive = document.getElementById('caseSensitive').checked;
      entry.partialMatch = document.getElementById('partialMatch').checked;
      break;
  }

  return entry;
}

function saveToHistory(entry) {
  chrome.storage.local.get(HISTORY_KEY, function(result) {
    let history = result[HISTORY_KEY] || [];
    const dedupKey = `${entry.searchType}:${entry.identifier}`;
    history = history.filter(e => `${e.searchType}:${e.identifier}` !== dedupKey);
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    chrome.storage.local.set({ [HISTORY_KEY]: history }, function() { renderHistory(history); });
  });
}

function loadHistory() {
  chrome.storage.local.get(HISTORY_KEY, function(result) {
    renderHistory(result[HISTORY_KEY] || []);
  });
}

function renderHistory(history) {
  const section = document.getElementById('historySection');
  const list = document.getElementById('historyList');

  if (history.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = '';

  history.forEach(function(entry) {
    const li = document.createElement('li');
    li.className = 'history-item';

    const badge = document.createElement('span');
    badge.className = `history-badge history-badge--${entry.searchType}`;
    badge.textContent = formatTypeBadge(entry.searchType);

    const swatch = document.createElement('span');
    swatch.className = 'history-swatch';
    swatch.style.backgroundColor = entry.color;

    const label = document.createElement('span');
    label.className = 'history-label';
    label.textContent = formatHistoryLabel(entry);
    label.title = formatHistoryLabel(entry);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'history-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Remove';
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      deleteHistoryEntry(entry.timestamp);
    });

    li.appendChild(badge);
    li.appendChild(swatch);
    li.appendChild(label);
    li.appendChild(deleteBtn);
    li.addEventListener('click', function() { applyHistoryEntry(entry); });
    list.appendChild(li);
  });
}

function deleteHistoryEntry(timestamp) {
  chrome.storage.local.get(HISTORY_KEY, function(result) {
    const history = (result[HISTORY_KEY] || []).filter(e => e.timestamp !== timestamp);
    chrome.storage.local.set({ [HISTORY_KEY]: history }, function() { renderHistory(history); });
  });
}

function applyHistoryEntry(entry) {
  const searchTypeEl = document.getElementById('searchType');
  searchTypeEl.value = entry.searchType;

  // updateSearchOptions is scoped inside DOMContentLoaded, trigger via change event
  searchTypeEl.dispatchEvent(new Event('change'));

  switch (entry.searchType) {
    case 'class':
    case 'id':
      document.getElementById('identifierInput').value = entry.term || '';
      break;
    case 'css-selector':
      document.getElementById('cssSelectorInput').value = entry.cssSelector || '';
      break;
    case 'attribute':
      document.getElementById('attributeName').value = entry.attributeName || '';
      document.getElementById('attributeValue').value = entry.attributeValue || '';
      break;
    case 'text-content':
      document.getElementById('textContentInput').value = entry.text || '';
      document.getElementById('caseSensitive').checked = entry.caseSensitive;
      document.getElementById('partialMatch').checked = entry.partialMatch;
      break;
  }

  const colorInput = document.getElementById('colorInput');
  colorInput.value = entry.color;
  ['colorInputCssSelector', 'colorInputAttribute', 'colorInputText'].forEach(function(id) {
    document.getElementById(id).value = entry.color;
  });

  document.getElementById('highlightButton').click();
}
