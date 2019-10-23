alert("Hello from your Chrome extension! v1.1")

var links = document.getElementsByTagName('a')
var tagsMatch = []
let tinyLinks = []
const shorter = /^https?:\/\/(bit\.ly|tinyurl\.com|ow\.ly|snipurl\.com)\/[0-9a-zA-Z]+$/

for (let i = 0; i < links.length; i++) {
  const href = links[i].getAttribute('href')
  if (href != null && href.match(shorter)) {
    let newURL = new URL(links[i].getAttribute('href'))
    tagsMatch.push(links[i])
    tinyLinks.push(newURL.hostname + newURL.pathname)
  }
}

console.log(tinyLinks)
console.log(tagsMatch)

let res = makeRequest(tinyLinks, tagsMatch)

function makeRequest (links, tags) {
  let serverURL = 'http://192.168.56.133:5000/api/bulk_resolve'
  let requestJson = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(links)
  }
  fetch(serverURL, requestJson).then((res) => {
    return res.json()
  }).then(data => {
    let resolved = 0
    for (let i = 0; i < data.length; i++) {
      if (data[i] !== null) {
        ++resolved
        tags[i].setAttribute('href', data[i])
      }
    }
    chrome.storage.sync.set({'counter': resolved})
  }).catch((res) => {
    return null
  })
}