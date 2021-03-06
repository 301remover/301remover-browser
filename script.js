/* global chrome, Blob, Response */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */

var tagsMatch = []
const tinyLinks = []

const masterRegex = /^http(s?):\/\/(bit\.ly|tinyurl\.com|goo\.gl)/
const alphanumericRegex = /[^a-zA-Z\d\s:]/
const shortenersURL = 'http://301r.dev/api/shorteners'
const resolverURL = 'http://301r.dev/api/unshorten/'

const getShorteners = () => {
  const requestJson = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }
  return fetchResource(shortenersURL, requestJson).then((res) => {
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

getShorteners().then((shortenerRegex) => {
  const nodes = document.getElementsByTagName('a')
  const links = Array.from(nodes).map((node) =>
    ({
      href: node.getAttribute('href'),
      node: node
    })
  ).filter(({ href }) =>
    href != null
  ).map(({ href, node }) => {
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
    const newURL = new URL(link.href)
    tinyLinks.push(newURL.hostname + newURL.pathname)
    return link
  })
  resolveURLs(links, tagsMatch)
})

function fetchResource (input, init) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      input,
      init
    }, messageResponse => {
      const [response, error] = messageResponse
      if (response === null) {
        reject(error)
      } else {
        const body = response.body ? new Blob([response.body]) : undefined
        resolve(new Response(body, {
          status: response.status,
          statusText: response.statusText
        }))
      }
    })
  })
}

function resolveURLs (links, tags) {
  const requestLinks = links.map((link) =>
    ({
      domain: link.domain,
      shortcode: link.shortcode
    })
  )
  const requestJson = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      shortlinks: requestLinks
    })
  }
  return fetchResource(resolverURL, requestJson).then((res) => {
    return res.json()
  }).then(resp => {
    let resolved = 0
    for (let i = 0; i < resp.length; i++) {
      if (resp[i] !== null) {
        ++resolved
        tags[i].setAttribute('href', resp[i])
      }
    }
    chrome.storage.sync.set({
      counter: resolved
    })
  })
}
