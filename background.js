/* global chrome, fetch */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }]  */

const masterRegex = /^http(s?):\/\/(bit\.ly|tinyurl\.com|goo\.gl)/
const alphanumericRegex = /[^a-zA-Z\d\s:]/
const shortenersURL = 'http://301r.dev/api/shorteners'
const baseURL = 'http://301r.dev/api/redirect/'
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
    return res.json()
  }).then(resp => {
    const shortenerRegex = {}
    for (const key in resp.data) {
      const obj = (resp.data[key])
      var shortcodeAlphabetEdited = ''
      for (var i = 0; i < obj.shortcode_alphabet.length; i++) {
        if (alphanumericRegex.test(obj.shortcode_alphabet.charAt(i))) {
          shortcodeAlphabetEdited += '\\' + obj.shortcode_alphabet.charAt(i)
        } else {
          shortcodeAlphabetEdited += obj.shortcode_alphabet.charAt(i)
        }
      }
      shortenerRegex[obj.domain] = new RegExp(obj.url_pattern.replace('{shortcode}', '([' + shortcodeAlphabetEdited + ']+)'))
    }
    return shortenerRegex
  })
}

chrome.runtime.onStartup.addListener(function () {
  getShorteners().then((resp) => {
    shortenerRegex = resp
  })
})

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.type === 'main_frame' && masterRegex.test(details.url)) {
      const [_, _httpsMatch, domain] = details.url.match(masterRegex)
      const [_protocolDomain, shortcode] = details.url.match(shortenerRegex[domain])
      var url = baseURL + domain + '/' + shortcode
      return { redirectUrl: url }
    }
  }, { urls: ['<all_urls>'] }, ['blocking']
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
