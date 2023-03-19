chrome.runtime.onMessage.addListener(function(message) {
  switch(message.name) {
    case 'highlight':
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      });
      break;
    case 'reset':
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {name: 'reset'});
      });
      break;
  }
});
