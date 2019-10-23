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