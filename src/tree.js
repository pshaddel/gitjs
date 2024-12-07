const fs = require("node:fs").promises;
const crypto = require("node:crypto");

// TODO: we have to create this tree only from the staged files not all the files in the folder
// TODO: If the files are already in the tree, we don't need to create a new tree object, we can use the existing one
async function createTreeObjectsFromPaths(folderPath) {
	let treeFileContent = "";
	let treeHash = "";
	// we want to create a tree object similar to git ls-tree
	const listOfFilesAndFolders = await fs.readdir(folderPath, {
		withFileTypes: true,
	});
	// if it is a file we want to store the hash of the file, if it is a directory we want to call this function recursively
	for (const fileOrFolder of listOfFilesAndFolders) {
		const fileType = fileOrFolder.isDirectory() ? "tree" : "blob";
		const fileName = fileOrFolder.name;
		let fileHash = "";
		if (fileType === "tree") {
			const treeHash = await createTreeObjectsFromPaths(
				`${folderPath}/${fileName}`,
			);
			fileHash = treeHash;
		} else {
			// here we need to calculate the hash of the file
			fileHash = await getHashOfFile(`${folderPath}/${fileName}`);
		}
		const fileMode = await getTreeFileMode(
			fileType,
			`${folderPath}/${fileName}`,
		);
		const fileModeAndName = `${fileMode} ${fileType} ${fileHash} ${fileName}`;
		treeFileContent += `${fileModeAndName}\n`;
	}
	const hash = crypto.createHash("sha1");
	hash.update(treeFileContent);
	treeHash = hash.digest("hex");
	// write the tree object to the objects folder
	if (!(await folderOrFileExist(`.gitj/objects/${treeHash.slice(0, 2)}`))) {
		await fs.mkdir(`.gitj/objects/${treeHash.slice(0, 2)}`, {
			recursive: true,
		});
	}
	if (
		await folderOrFileExist(
			`.gitj/objects/${treeHash.slice(0, 2)}/${treeHash.slice(2)}`,
		)
	) {
		// a tree with the same content already exists
		console.log(`.gitj/objects/${treeHash.slice(0, 2)}/${treeHash.slice(2)}`);
		return treeHash;
	}
	// write the file to the objects folder
	await fs.writeFile(
		`.gitj/objects/${treeHash.slice(0, 2)}/${treeHash.slice(2)}`,
		treeFileContent,
	);
	// console.log(`.gitj/objects/${treeHash.slice(0, 2)}/${treeHash.slice(2)} \n`, treeFileContent);
	return treeHash;
}

// createTreeObjectsFromPaths('./sample');

async function getTreeFileMode(fileType, fileOrFolder) {
	const { mode } = await fs.stat(fileOrFolder);
	return fileType === "tree"
		? "040000"
		: `100${// biome-ignore lint/style/useNumericLiterals: <explanation>
		(mode & Number.parseInt("777", 8)).toString(8)}`;
}

async function getHashOfFile(path) {
	const content = await fs.readFile(path);
	const hash = crypto.createHash("sha1");
	hash.update(content);
	const sha = hash.digest("hex");
	return sha;
}

async function folderOrFileExist(folderOrFilePath) {
	try {
		await fs.access(folderOrFilePath);
		return true;
	} catch (error) {
		return false;
	}
}

module.exports = {
	createTreeObjectsFromPaths,
	getTreeFileMode,
	getHashOfFile,
	folderOrFileExist,
};
