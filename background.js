const masterRegex = /^http(s?):\/\/(bit\.ly|tinyurl\.com|goo\.gl)/
const shortenersURL = 'http://301r.dev/api/shorteners'
const resolverURL = 'http://301r.dev/api/unshorten'

shortenerRegex = {}

getShorteners = () => {
  const requestJson = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
  return fetch(shortenersURL, requestJson).then((res) => {
    return res.json()
  }).then(resp => {
    let shortenerRegex = {}
    for (let key in resp.data) {
      let obj = (resp.data[key])
      regexStr = obj.url_pattern.replace("{shortcode}", "([" + obj.shortcode_alphabet + "]+)")
      shortenerRegex[obj.domain] = new RegExp(regexStr)
    }
    return shortenerRegex
  })
}
      
chrome.runtime.onStartup.addListener(function () {
  getShorteners().then((resp) => {
    console.log(shortenerRegex)
    shortenerRegex = resp
  })
})

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    color: '#3aa757'
  }, function () {
    console.log('The color is green.');
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        css: ["a"]
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.type !== 'main_frame' || !masterRegex.test(details.url)) {
      return
    }
    return { cancel: true} 
  }, {
    urls: ["<all_urls>"]}, ["blocking"]
)

chrome.webRequest.onErrorOccurred.addListener(
  function (details) {
    const {
      tabId,
      requestId
    } = details;
    if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
      return;
    }
  }, {
    urls: ["<all_urls>"]
  }
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  fetch(request.input, request.init).then(function (response) {
    return response.text().then(function (text) {
      sendResponse([{
        body: text,
        status: response.status,
        statusText: response.statusText,
      }, null]);
    });
  }, function (error) {
    sendResponse([null, error]);
  });
  return true;
});