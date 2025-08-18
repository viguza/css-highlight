chrome.runtime.onMessage.addListener(function(message) {
  switch(message.name) {
    case 'highlight':
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          name: 'highlight',
          searchType: message.searchType,
          identifier: message.identifier,
          color: message.color,
          highlightStyle: message.highlightStyle,
          opacity: message.opacity,
          textColor: message.textColor,
          changeTextColor: message.changeTextColor
        });
      });
      break;
    case 'reset':
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {name: 'reset'});
      });
      break;
  }
});
