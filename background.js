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
    console.log('Startup hit')
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
    console.log('before request');
    if (details.type !== 'main_frame' || !masterRegex.test(details.url)) {
      return 
    }
    console.log('hit')
    let domainMatch = details.url.match(masterRegex)
    let match = details.url.match(shortenerRegex[domainMatch[2]])

    console.log(domainMatch)
    console.log(match)

    let link = {
      domain: domainMatch[2],
      shortcode: match[1]
    }
    console.log(link)

    let respFromServer = resolveURLs(link)

    respFromServer.then(function (value) {
      console.log(value);
      return {
        redirectUrl: value
      };
    })
  }, {
    urls: ["<all_urls>"]
  }, ["blocking"]
);

// chrome.webRequest.onCompleted.addListener(
//   function (details) {
//     const {
//       tabId,
//       requestId
//     } = details;
//     if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
//       return;
//     }

//     const request = tabStorage[tabId].requests[requestId];

//     Object.assign(request, {
//       endTime: details.timeStamp,
//       requestDuration: details.timeStamp - request.startTime,
//       status: 'complete'
//     });
//     console.log(tabStorage[tabId].requests[details.requestId]);
//   }, {
//     urls: ["<all_urls>"]
//   }
// );

chrome.webRequest.onErrorOccurred.addListener(
  function (details) {
    //console.log('Web Request Error Occurred');
    //console.log(details);
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


//TODO chrome.runtime.onStartup to get the master regex from server


function resolveURLs(link) {
  console.log(link)
  const requestLink = [{
    domain: link.domain,
    shortcode: link.shortcode
  }]
  console.log(JSON.stringify({
    shortlinks: requestLink
  }))
  const requestJson = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      shortlinks: requestLink
    })
  }
  return fetch(resolverURL, requestJson).then((res) => {
    return res.json()
  }).then(resp => {
    console.log(resp)
    return resp[0]
  }).catch((res) => {
    console.log("ERROR: " + res);
    return null
  })
}