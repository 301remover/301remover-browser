/* global chrome */

const counter = document.getElementById('counter')

chrome.storage.sync.get('counter', function (data) {
  counter.innerHTML = 'Resolved urls: ' + data.counter
})
