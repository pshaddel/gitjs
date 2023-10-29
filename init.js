const fs = require("fs");

function init() {
    // creates a folder called .gitj and creates a subfolder called .gitj/objects and .gitj/refs and .gitj/refs/heads
    fs.mkdirSync(".gitj");
    fs.mkdirSync(".gitj/objects");
    fs.mkdirSync(".gitj/refs");
    fs.mkdirSync(".gitj/refs/heads");
    // creates a file called .gitj/refs/heads/master
    fs.writeFileSync(".gitj/refs/heads/master", "");
}

init();