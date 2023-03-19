document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('highlightButton').addEventListener('click', function(event) {
    event.preventDefault();

    var searchType = document.getElementById('searchType').value;
    var identifier = document.getElementById('identifierInput').value;

    chrome.runtime.sendMessage({
      type: 'highlight',
      searchType: searchType,
      identifier: identifier
    });
  });
});
