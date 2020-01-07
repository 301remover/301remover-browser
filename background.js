/* global chrome, fetch */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "shortenerRegex", "httpsMatch" }] */

const masterRegex = /^http(s?):\/\/(bit\.ly|tinyurl\.com|goo\.gl)/
// const shortenersURL = 'http://301r.dev/api/shorteners'
// const baseURL = 'http://301r.dev/api/redirect/'

const shortenersURL = 'http://localhost:4000/api/shorteners'
const baseURL = 'http://localhost:4000/api/redirect/'

var shortenerRegex = {}

const getShorteners = () => {
  const requestJson = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }
  return fetch(shortenersURL, requestJson).then((res) => {
    console.log('getShorteners')
    return res.json()
  }).then(resp => {
    const shortenerRegex = {}
    for (const key in resp.data) {
      const obj = (resp.data[key])
      shortenerRegex[obj.domain] = new RegExp(obj.url_pattern.replace('{shortcode}', '([' + obj.shortcode_alphabet + ']+)'))
    }
    return shortenerRegex
  })
}

chrome.runtime.onStartup.addListener(function () {
  getShorteners().then((resp) => {
    shortenerRegex = resp
  })
})

chrome.runtime.onInstalled.addListener(function () {
  console.log('startup')
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        css: ['a']
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }])
  })
})

// redirect/domain/shortcode
// chrome.webRequest.onBeforeRequest.addListener(
//   function (details) {
//     console.log('onbeforerequest')
//     if (details.type !== 'main_frame' || !masterRegex.test(details.url)) {
//       return
//     }
//     return { cancel: true }
//   }, { urls: ['<all_urls>'] }, ['blocking']
// )

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.type === 'main_frame' && masterRegex.test(details.url)) {
      // it's a shortened link
      const masterRegexMatch = details.url.match(masterRegex)
      console.log(masterRegexMatch)
      const domain = masterRegexMatch[2]
      console.log(domain)
      console.log(shortenerRegex[domain])
      const shortenerRegexMatch = details.url.match(shortenerRegex[domain])
      console.log(shortenerRegexMatch)
      var url = baseURL + domain + '/' + shortenerRegexMatch[1]
      console.log(url)
      return { redirectUrl: url }
    }
  }, { urls: ['<all_urls>'] }
)

// Listens for messages to call fetch from background
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  fetch(request.input, request.init).then(function (response) {
    return response.text().then(function (text) {
      sendResponse([{
        body: text,
        status: response.status,
        statusText: response.statusText
      }, null])
    })
  }, function (error) {
    sendResponse([null, error])
  })
  return true
})
