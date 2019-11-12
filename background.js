/* global chrome, fetch */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "shortenerRegex" }] */

const masterRegex = /^http(s?):\/\/(bit\.ly|tinyurl\.com|goo\.gl)/
const shortenersURL = 'http://301r.dev/api/shorteners'

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
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        css: ['a']
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }])
  })
})

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.type !== 'main_frame' || !masterRegex.test(details.url)) {
      return
    }
    return { cancel: true }
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
