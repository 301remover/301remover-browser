var links = document.getElementsByTagName('a')
var tagsMatch = []
let tinyLinks = []
const shorter = /^https?:\/\/(bit\.ly|tinyurl\.com|ow\.ly|snipurl\.com)\/[0-9a-zA-Z]+$/

let shorteners = []

function getShorteners() {
  let serverUrl = ''
  let requestJson = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  fetch(serverUrl, requestJson).then((res) => {
    console.log(res);
    console.log(res.json());
    return res.json();
  }).then(data => {
    console.log('data: ' + data);
  })
}

getShorteners(); //got shorteners

for (let i = 0; i < links.length; i++) {
  const href = links[i].getAttribute('href')
  /*
  if (href != null && href.match(shorter)) { //TODO change to check using contains and shorteners
    let newURL = new URL(links[i].getAttribute('href'))
    tagsMatch.push(links[i])
    tinyLinks.push(newURL.hostname + newURL.pathname)
  }
  */

  //can't be a contains, has to be startsWith???
  //but then we have to loop over the whole list
  if (href != null) {
    shorteners.forEach(function(element) {
      console.log(href + ' *** ' + element);
      if(href.startsWith(element)) {
        let newURL = new URL(links[i].getAttribute('href'));
        tagsMatch.push(links[i]);
        tinyLinks.push(newURL.hostname + newURL.pathname);
      }
  });
}

let res = makeRequest(tinyLinks, tagsMatch)

function makeRequest(links, tags) {
  var data = ['https://www.google.com', 'https://archive.org']
  let resolved = 0
  for(let i = 0; i < data.length; i++) {
    if(data[i] !== null) {
      ++resolved
      tags[i].setAttribute('href', data[i])
    }
  }
  chrome.storage.sync.set({'counter': resolved})
}


console.log(tinyLinks)
console.log(tagsMatch)