var links = document.getElementsByTagName("a");
for (let i = 0; i < links.length; i++){
  console.log("it works!")
  links[i].setAttribute("href", "https://google.com");
}