const fs = require("node:fs/promises");
const folderPath = "./sample";
async function checkout(commitHash) {
	const listOfFilesToCreate = [];
	// store the commit hash in the refs folder
	await fs.writeFile(".gitj/HEAD", commitHash);
	const { data, error } = await getTreeHashFromCommit(commitHash);
	if (error) {
		console.log(error);
		process.exit(1);
		return;
	}
	const treeHash = data;
	// get tree file
	const baseTree = await convertTreeObject(treeHash, "", []);
	// clear the folder
	await removeAllFilesAndFolders(folderPath);
	// create the files and folders based on address on the blob
	await createFilesAndFolders(baseTree, folderPath);
}

async function getTreeHashFromCommit(commitHash) {
	try {
		let commitContent = null;
		// Git first check if the passed arg is a branch name
		if (await isBranch(commitHash)) {
			// if it is a branch name, it will read the file and get the commit hash
			const branchHash = await fs.readFile(
				`.gitj/refs/heads/${commitHash}`,
				"utf-8",
			);
			commitContent = await fs.readFile(
				`.gitj/objects/${branchHash.slice(0, 2)}/${branchHash.slice(2)}`,
				"utf-8",
			);
		} else if (await isCommit(commitHash)) {
			// if it is a commit hash, it will read the file and get the commit hash
			commitContent = await fs.readFile(
				`.gitj/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`,
				"utf-8",
			);
		} else {
			return { error: "Branch or Commit not found" };
		}
		const array = commitContent.split("\n").map((e) => e.split(" "));
		const elem = array.find((e) => e[0] === "tree");
		return { data: elem[1], error: null };
	} catch (e) {
		return { error: "Unkown Error" };
	}
}

async function isBranch(branchName) {
	try {
		await fs.readFile(`.gitj/refs/heads/${branchName}`, "utf-8");
		return true;
	} catch (error) {
		return false;
	}
}

async function isCommit(commitHash) {
	try {
		await fs.readFile(
			`.gitj/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`,
			"utf-8",
		);
		return true;
	} catch (error) {
		return false;
	}
}

async function convertTreeObject(treeHash, folderPrefix = "", files = []) {
	const treeObject = await fs
		.readFile(
			`.gitj/objects/${treeHash.slice(0, 2)}/${treeHash.slice(2)}`,
			"utf-8",
		)
		.catch((e) => console.log("Convert Tree Object Error:", e));
	const array = treeObject.split("\n").map((e) => e.split(" "));
	for (const file of array) {
		if (!file || file.length < 2) continue;
		const [mode, type, hash, name] = file;
		if (type === "tree") {
			await convertTreeObject(hash, `${folderPrefix + name}/`, files).catch(
				(e) => console.log("Convert Tree Object type Tree Error:", e),
			);
		} else {
			files.push({
				mode: mode,
				type: type,
				hash: hash,
				name: folderPrefix + name,
			});
		}
	}
	return files;
}

function removeAllFilesAndFolders() {
	return fs.rm(folderPath, { recursive: true, force: true });
}

async function createFilesAndFolders(files, folderPath) {
	for (const file of files) {
		const { mode, type, hash, name } = file;
		if (type === "tree") {
			await fs.mkdir(`${folderPath}/${name}`, { recursive: true });
		} else {
			const content = await fs.readFile(
				`.gitj/objects/${hash.slice(0, 2)}/${hash.slice(2)}`,
			);
			await fs.writeFile(`${folderPath}/${name}`, content);
		}
	}
}

// checkout('master');
module.exports = { checkout };
