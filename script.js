var links = document.getElementsByTagName("a");
for (let i = 0; i < links.length; i++){
  let shorter = /^https?:\/\/(bit\.ly|tinyurl\.com|ow\.ly|snipurl\.com)\/[0-9a-zA-Z]+$/;
  console.log(links[i].getAttribute("href").match(shorter));
  if (links[i].getAttribute("href").match(shorter)){
    links[i].setAttribute("href", "https://google.com");
  }

}