const fs = require("node:fs").promises;
const crypto = require("node:crypto");
const { gitJSFolderExists } = require("./utils");
const { createTreeObjectsFromPaths, folderOrFileExist } = require("./tree");
async function commit(commitMessage) {
	// check if the gitjs folder exists
	if (!gitJSFolderExists()) {
		console.log("Not a git repository");
		process.exit(1);
	}

	if (!(await isThereStagedFiles())) {
		console.log("Nothing to commit");
		process.exit(1);
	}

	const treeHash = await createTreeObjectsFromPaths("./sample");
	const parentHash = await getLatestCommitHash();
	const author = "test";
	const committer = "test";
	const commitDate = Date.now();
	const commitContent = `tree ${treeHash}\nparent ${parentHash}\nauthor ${author}\ncommitter ${committer}\ncommit date ${commitDate}\n${commitMessage}`;
	const hash = crypto.createHash("sha1");
	hash.update(commitContent);
	const commitHash = hash.digest("hex");
	// write the commit object to the objects folder
	if (!(await folderOrFileExist(`.gitj/objects/${commitHash.slice(0, 2)}`))) {
		await fs.mkdir(`.gitj/objects/${commitHash.slice(0, 2)}`, {
			recursive: true,
		});
	}
	if (
		await folderOrFileExist(
			`.gitj/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`,
		)
	) {
		// a commit with the same content already exists
		console.log(
			`.gitj/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`,
		);
		return commitHash;
	}
	// write the file to the objects folder
	await fs.writeFile(
		`.gitj/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`,
		commitContent,
	);
	// set the head of current branch to the commit hash
	await fs.writeFile(".gitj/refs/heads/master", commitHash);
	// empty the index(where we store staged files)
	await fs.writeFile(".gitj/index", "");
	return commitHash;
}

async function isThereStagedFiles() {
	const index = await fs.readFile(".gitj/index", "utf-8");
	return index !== "";
}

async function getLatestCommitHash() {
	const refs = await fs.readFile(".gitj/refs/heads/master", "utf-8");
	return refs.trim();
}

module.exports = { commit };
