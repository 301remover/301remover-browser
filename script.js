var links = document.getElementsByTagName("a");
let tinyLinks = [];
for (let i = 0; i < links.length; i++){
  let shorter = /^https?:\/\/(bit\.ly|tinyurl\.com|ow\.ly|snipurl\.com)\/[0-9a-zA-Z]+$/;
  console.log(links[i].getAttribute("href").match(shorter));
  if (links[i].getAttribute("href").match(shorter)){
    let newURL = new URL(links[i].getAttribute("href"));
    tinyLinks.push(newURL.hostname + newURL.pathname);
  }
  console.log("it works!")
}
console.log(tinyLinks);
let res = makeRequest(tinyLinks);
console.log("it made the request!");
console.log(res);

function makeRequest(links) {
  let serverURL = '192.168.56.133:5000/api/bulk_resolve';
  let requestJson = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: {
      links
    }
  }
  fetch(serverURL, requestJson).then((res) => {
    console.log("then")
    console.log(res);
    if (res.ok) {
      console.log(res);
      return res.json()
    } else {
      console.log("error");
      console.log(res);
      return null;
    }
  }).catch((res) => {
    console.log("error in catch");
    console.log(res.message);
    console.log(serverURL);
    return null
  });
}