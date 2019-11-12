var tagsMatch = []
let tinyLinks = []

const masterRegex = /^http(s?):\/\/(bit\.ly|tinyurl\.com|goo\.gl)/
const shortenersURL = 'http://301r.dev/api/shorteners'
const resolverURL = 'http://301r.dev/api/unshorten'

getShorteners = () => {
  const requestJson = {
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
    ({
      href: node.getAttribute('href'),
      node: node
    })
  ).filter(({
      href: href
    }) =>
    href != null
  ).map(({
    href: href,
    node: node
  }) => {
    return {
      href: href,
      node: node,
      match: href.match(masterRegex)
    }
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

  let res = resolveURLs(links, tagsMatch)
})

function fetchResource(input, init) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      input,
      init
    }, messageResponse => {
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

function resolveURLs(links, tags) {
  const requestLinks = links.map((link) =>
    ({
      domain: link.domain,
      shortcode: link.shortcode
    })
  )
  console.log(JSON.stringify({
    shortlinks: requestLinks
  }))
  const requestJson = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      shortlinks: requestLinks
    })
  }
  return fetchResource(resolverURL, requestJson).then((res) => {
    return res.json()
  }).then(resp => {
    console.log(resp)
    let resolved = 0
    for (let i = 0; i < resp.length; i++) {
      if (resp[i] !== null) {
        ++resolved
        tags[i].setAttribute('href', resp[i])
      }
    }
    chrome.storage.sync.set({
      'counter': resolved
    })
  }).catch((res) => {
    console.log("ERROR: " + res);
    return null
  })
}