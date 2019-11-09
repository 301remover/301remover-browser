
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log('The color is green.');
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          css: ["a"]
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });
chrome.runtime

/*
(function() {

  chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log('The color is green.');
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          css: ["a"]
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });

  chrome.webRequest.onBeforeRequest.addListener((details) => {
      const { tabId, requestId } = details;
      if (!tabStorage.hasOwnProperty(tabId)) {
          return;
      }

      tabStorage[tabId].requests[requestId] = {
          requestId: requestId,
          url: details.url,
          startTime: details.timeStamp,
          status: 'pending'
      };
      console.log(tabStorage[tabId].requests[requestId]);
  });

  chrome.webRequest.onCompleted.addListener((details) => {
      const { tabId, requestId } = details;
      if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
          return;
      }

      const request = tabStorage[tabId].requests[requestId];

      Object.assign(request, {
          endTime: details.timeStamp,
          requestDuration: details.timeStamp - request.startTime,
          status: 'complete'
      });
      console.log(tabStorage[tabId].requests[details.requestId]);
  });

  chrome.webRequest.onErrorOccurred.addListener((details)=> {
      console.log('Web Request Error Occurred: ' + details);
      const { tabId, requestId } = details;
      if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
          return;
      }
  });
}());
*/