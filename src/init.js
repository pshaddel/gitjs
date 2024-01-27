const fs = require("fs");

function init(folder = './') {
    // return error if the .gitj folder already exists
    try {
        fs.accessSync(folder + ".gitj");
        console.log("Git repository already initialized.");
        process.exit(1);
    } catch (error) {
        // creates a folder called .gitj and creates a subfolder called .gitj/objects and .gitj/refs and .gitj/refs/heads
        fs.mkdirSync(folder + ".gitj");
        fs.mkdirSync(folder + ".gitj/objects");
        fs.mkdirSync(folder + ".gitj/refs");
        fs.mkdirSync(folder + ".gitj/refs/heads");
        // creates a file called .gitj/refs/heads/master
        fs.writeFileSync(folder + ".gitj/refs/heads/master", "");
        // creates a file called .gitj/HEAD
        fs.writeFileSync(folder + ".gitj/HEAD", "ref: refs/heads/master");
        // index file to store staged files
        fs.writeFileSync(folder + ".gitj/index", "");

        console.log("Initialized empty Git repository in " + folder + ".gitj");
    }
}

module.exports = { init };