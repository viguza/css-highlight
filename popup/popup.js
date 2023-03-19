document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('highlightButton').addEventListener('click', function(event) {
    event.preventDefault();

    var searchType = document.getElementById('searchType').value;
    var identifier = document.getElementById('identifierInput').value;
    var color = document.getElementById('colorInput').value;

    if (identifier !== '') {
      chrome.runtime.sendMessage({
        name: 'highlight',
        searchType: searchType,
        identifier: identifier,
        color: color
      });
    }
  });

  document.getElementById('resetButton').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('searchType').value = 'both'
    document.getElementById('identifierInput').value = ''
    document.getElementById('colorInput').value = '#ffdc00'
    chrome.runtime.sendMessage({
      name: 'reset',
    });
  });
});
