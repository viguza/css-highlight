document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('highlightButton').addEventListener('click', function(event) {
    event.preventDefault();

    var searchType = document.getElementById('searchType').value;
    var identifier = document.getElementById('identifierInput').value;
    var color = document.getElementById('colorInput').value;

    chrome.runtime.sendMessage({
      searchType: searchType,
      identifier: identifier,
      color: color
    });
  });
});
