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

  chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
    console.log('before request');
    if(details.type === 'main_frame') {
      if(details.url.includes('bit.ly')) {
        console.log('ALERT BITLY DETECTED');
        return { redirectUrl: "http://www.google.com" }; 
      }
    }
  },
    {urls: ["<all_urls>"]}, ["blocking"]
  );

  chrome.webRequest.onCompleted.addListener(
    function(details) {
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
  },
    {urls: ["<all_urls>"]}
  );

  chrome.webRequest.onErrorOccurred.addListener(
    function(details) {
      //console.log('Web Request Error Occurred');
      //console.log(details);
      const { tabId, requestId } = details;
      if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
          return;
      }
  },
    {urls: ["<all_urls>"]}
  );

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  fetch(request.input, request.init).then(function(response) {
    return response.text().then(function(text) {
      sendResponse([{
        body: text,
        status: response.status,
        statusText: response.statusText,
      }, null]);
    });
  }, function(error) {
    sendResponse([null, error]);
  });
  return true;
});