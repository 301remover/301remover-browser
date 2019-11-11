
var tagsMatch = []
let tinyLinks = []

const masterRegex = /^http(s?):\/\/(bit\.ly|tinyurl\.com|goo\.gl)/
const shortenersURL = 'http://301r.dev/api/shorteners'

getShorteners = () => {
  let requestJson = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
  return fetchResource(shortenersURL, requestJson).then((res) => {
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

getShorteners().then((shortenerRegex) => {
  let nodes = document.getElementsByTagName('a')
  console.log(nodes)
  links = Array.from(nodes).map((node) =>
    ({href: node.getAttribute('href'), node: node})
  ).filter(({href: href}) =>
    href != null
  ).map(({href: href, node: node}) => {
    return {href: href, node: node, match: href.match(masterRegex)}
  }).filter((link) => {
    return link.match != null
  }).map((link) => {
    const [_, httpsMatch, domain] = link.match
    const shortenerRegexMatch = link.href.match(shortenerRegex[domain])
    return {
      href: link.href,
      node: link.node,
      domain: domain,
      shortcode: shortenerRegexMatch == null ? null : shortenerRegexMatch[1],
      isHttps: httpsMatch !== ''
    }
  }).filter((link) =>
    link.shortcode != null
  ).map((link) => {
    tagsMatch.push(link.node)
    let newURL = new URL(link.href)
    tinyLinks.push(newURL.hostname + newURL.pathname)
    return link
  })
  console.log(links)
  console.log(tagsMatch)
  console.log(tinyLinks)



  // for (let i = 0 i < links.length i++) {
  //   
  //   if (href != null && masterRegex.test(href)) {

  //     let masterMatch = href.match(masterRegex)
  //     console.log(masterMatch)

  //     if(masterMatch 
      

  //     for (let key in shortenerRegex) {
  //       re = shortenerRegex[key]
  //       // console.log(typeof(re) + ': ' + re)

  //       let match = href.match(re)
  //     }
  
  //     let newURL = new URL(links[i].getAttribute('href'))
  //     tagsMatch.push(links[i])
  //     tinyLinks.push(newURL.hostname + newURL.pathname)
  //   }
  
    /*
    if (href != null && href.match(shorter)) { //TODO change to check using contains and shorteners
      let newURL = new URL(links[i].getAttribute('href'))
      tagsMatch.push(links[i])
      tinyLinks.push(newURL.hostname + newURL.pathname)
    }
    /*
  
    /*
    //can't be a contains, has to be startsWith???
    //but then we have to loop over the whole list
    if (href != null) {
      shorteners.forEach(function(element) {
        console.log(href + ' *** ' + element)
        if(href.startsWith(element)) {
          let newURL = new URL(links[i].getAttribute('href'))
          tagsMatch.push(links[i])
          tinyLinks.push(newURL.hostname + newURL.pathname)
        }
    })
    */
  //}
  
  let res = makeRequest(tinyLinks, tagsMatch)
})





function fetchResource(input, init) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({input, init}, messageResponse => {
      const [response, error] = messageResponse
      if (response === null) {
        reject(error)
      } else {
        // Use undefined on a 204 - No Content
        const body = response.body ? new Blob([response.body]) : undefined
        resolve(new Response(body, {
          status: response.status,
          statusText: response.statusText,
        }))
      }
    })
  })
}

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
