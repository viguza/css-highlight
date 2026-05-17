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
          changeTextColor: message.changeTextColor,
          liveMode: message.liveMode
        });
      });
      break;
    case 'reset':
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {name: 'reset'});
      });
      break;
    case 'elementsFound':
      chrome.runtime.sendMessage(message).catch(() => {});
      break;
    case 'scrollToElement':
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      });
      break;
    case 'highlightCurrentElement':
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      });
      break;
    case 'getState':
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0]) return;
        chrome.tabs.sendMessage(tabs[0].id, { name: 'getState' }, function(state) {
          if (chrome.runtime.lastError || !state) return;
          chrome.runtime.sendMessage({ name: 'stateRestored', state: state }).catch(() => {});
        });
      });
      break;
  }
});
