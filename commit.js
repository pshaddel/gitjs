const fs = require('fs').promises;
const crypto = require('crypto');
const { createTreeObjectsFromPaths, folderOrFileExist } = require('./tree');
async function commit(commitMessage) {
    const treeHash = await createTreeObjectsFromPaths('./sample');
    const parentHash = await getLatestCommitHash();
    const author = 'test';
    const committer = 'test';
    const commitDate = Date.now();
    const commitContent = `tree ${treeHash}\nparent ${parentHash}\nauthor ${author}\ncommitter ${committer}\ncommit date ${commitDate}\n${commitMessage}`;
    const hash = crypto.createHash("sha1");
    hash.update(commitContent);
    const commitHash = hash.digest("hex");
    // write the commit object to the objects folder
    if (!await folderOrFileExist(`.gitj/objects/${commitHash.slice(0, 2)}`)) {
        await fs.mkdir(`.gitj/objects/${commitHash.slice(0, 2)}`, { recursive: true });
    }
    if (await folderOrFileExist(`.gitj/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`)) {
        // a commit with the same content already exists
        console.log(`.gitj/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`);
        return commitHash;
    }
    // write the file to the objects folder
    await fs.writeFile(`.gitj/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`, commitContent);
    // set the head of current branch to the commit hash
    await fs.writeFile('.gitj/refs/heads/master', commitHash);
    return commitHash;
}
commit('first commit');

async function getLatestCommitHash() {
    const refs = await fs.readFile('.gitj/refs/heads/master', 'utf-8');
    return refs.trim();
}
