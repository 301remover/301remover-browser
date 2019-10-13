alert("Hello from your Chrome extension! v1.2")

function getText() {
    return document.body.innerText;
}

function getHTML() {
    return document.body.outerHTML;
}

console.log(getText());
console.log(getHTML());