let originalElements = [];

chrome.runtime.onMessage.addListener(function(message) {
  if(message.name === 'highlight') {
    highlight(message.searchType, message.identifier, message.color);
  }
  if(message.name === 'reset') {
    reset();
  }
});

function highlight(type, identifier, color) {
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
    originalElements.push({object: element, color: element.style.backgroundColor});
    element.style.backgroundColor = color;
  }
}

function reset() {
  for (var i = 0; i < originalElements.length; i++) {
    let element = originalElements[i];
    if (element.object) {
      element.object.style.backgroundColor = element.color;
    }
  }
  originalElements = [];
}
