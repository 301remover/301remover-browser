var links = document.getElementsByTagName("a");
for (let i = 0; i < links.length; i++){
  let shorter = /^https?:\/\/(bit\.ly|tinyurl\.com|ow\.ly|snipurl\.com)\/[0-9a-zA-Z]+$/;
  console.log(links[i].getAttribute("href").match(shorter));
  if (links[i].getAttribute("href").match(shorter)){
    links[i].setAttribute("href", "https://google.com");
  }
  console.log("it works!")
}
let res = makeRequest(links);
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
    if (res.ok) {
      console.log(res);
      return res.json()
    } else {
      console.log("error");
      console.log(res);
      return null;
    }
  });
}