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

    // Update the range input fill after reset
    updateOpacityRange();

    chrome.runtime.sendMessage({
      name: 'reset',
    });
  });
});
