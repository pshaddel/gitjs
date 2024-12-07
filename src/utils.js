const path = require("node:path");
const fs = require("node:fs");
function gitJSFolderExists() {
	const commandPath = process.cwd();
	const path = `${commandPath}/.gitj`;
	console.log(path);
	try {
		fs.accessSync(path);
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

module.exports = { gitJSFolderExists };
