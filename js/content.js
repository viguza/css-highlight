chrome.runtime.onMessage.addListener(function(message) {
  if (message.searchType === 'class') {
    elements = document.getElementsByClassName(message.identifier);
  } else if (message.searchType === 'id') {
    var element = document.getElementById(message.identifier);
    elements = element ? [element] : [];
  } else {
    elements = document.querySelectorAll(`.${message.identifier},#${message.identifier}`);
  }

  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = '#ffdc00';
  }
});
