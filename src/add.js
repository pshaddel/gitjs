const fs = require("fs");
const crypto = require("crypto");
const { gitJSFolderExists } = require("./utils");

function add(files) {
  for (const filename of files) {
    // check if the gitjs folder exists
    if (!gitJSFolderExists()) {
      console.log("Not a git repository");
      process.exit(1);
    }
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
      if (!fs.existsSync(`${folder}.gitj/objects/${sha.slice(0, 2)}`)) {
        fs.mkdirSync(`${folder}.gitj/objects/${sha.slice(0, 2)}`, {
          recursive: true,
        });
      }
      if (
        fs.existsSync(
          `${folder}.gitj/objects/${sha.slice(0, 2)}/${sha.slice(2)}`,
        )
      ) {
        // a blob with the same content already exists
        // process.exit(0);
      } else {
        // write the file to the objects folder
        fs.writeFileSync(
          `${folder}.gitj/objects/${sha.slice(0, 2)}/${sha.slice(2)}`,
          content,
        );
      }
      // add file to the index
      addStagedFileToIndex(filename, sha, folder);
    } catch (error) {
      console.log(error);
      console.log(`File ${filename} does not exist.`);
      process.exit(1);
    }
  }
}

// add('./sample/src/readme.md')

function addStagedFileToIndex(filename, sha, folder) {
  const index = fs.readFileSync(folder + ".gitj/index", "utf-8");
  // format: 100644 hash filename
  // if the file is already in the index, recalculate the hash
  const lines = index.split("\n");
  const newLines = [];
  for (const line of lines) {
    if (!line) continue;
    const [mode, hash, name] = line.split(" ");
    if (name !== filename) {
      newLines.push(line);
    }
  }
  newLines.push(`100644 ${sha} ${filename}`);
  // console.log(newLines);
  fs.writeFileSync(folder + ".gitj/index", newLines.join("\n"));
}

module.exports = { add };
