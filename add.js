const fs = require("fs");
const crypto = require("crypto");
function add(filename) {
    try {
        // file exists?
        fs.accessSync(filename);
        // read the file
        const content = fs.readFileSync(filename);
        // hash the file
        const hash = crypto.createHash("sha1");
        hash.update(content);
        const sha = hash.digest("hex");
        // create a folder with the first two characters of the hash if it doesn't exist
        if (!fs.existsSync(`.gitj/objects/${sha.slice(0, 2)}`)) {
            fs.mkdirSync(`.gitj/objects/${sha.slice(0, 2)}`, { recursive: true });
        }
        if (fs.existsSync(`.gitj/objects/${sha.slice(0, 2)}/${sha.slice(2)}`)) {
            // a blob with the same content already exists
            process.exit(0);
        }
        // write the file to the objects folder
        fs.writeFileSync(`.gitj/objects/${sha.slice(0, 2)}/${sha.slice(2)}`, content);
    } catch (error) {
        console.log(error);
        console.log(`File ${filename} does not exist.`);
        process.exit(1);
    }
}

add('./sample/src/readme.md')