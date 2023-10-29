const fs = require('fs/promises');
const folderPath = './sample';
async function checkout(commitHash) {
    const listOfFilesToCreate = [];
    // store the commit hash in the refs folder
    await fs.writeFile('.gitj/HEAD', commitHash);
    const treeHash = await getTreeHashFromCommit(commitHash);
    // get tree file
    const baseTree = await convertTreeObject(treeHash, '', []);
    // clear the folder
    await removeAllFilesAndFolders(folderPath);
    // create the files and folders based on address on the blob
    await createFilesAndFolders(baseTree, folderPath);
}

async function getTreeHashFromCommit(commitHash) {
    const commitContent = await fs.readFile(`.gitj/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`, 'utf-8');
    const array = commitContent.split('\n').map(e=> e.split(' '))
    console.log(array);
    const elem = array.find(e => e[0] === 'tree');
    return elem[1];
}

async function convertTreeObject(treeHash, folderPrefix = '', files = []) {
    const treeObject = await fs.readFile(`.gitj/objects/${treeHash.slice(0, 2)}/${treeHash.slice(2)}`, 'utf-8');
    const array = treeObject.split('\n').map(e=> e.split(' '))
    for (const file of array) {
        if (!file || file.length < 2) continue;
        const [mode, type, hash, name] = file;
        if (type === 'tree') {
            await convertTreeObject(hash, folderPrefix + name + '/', files);
        } else {
            files.push({
                mode: mode,
                type: type,
                hash: hash,
                name: folderPrefix + name
            })
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
        if (type === 'tree') {
            await fs.mkdir(`${folderPath}/${name}`, { recursive: true });
        } else {
            const content = await fs.readFile(`.gitj/objects/${hash.slice(0, 2)}/${hash.slice(2)}`);
            await fs.writeFile(`${folderPath}/${name}`, content);
        }
    }
}

// checkout('43efe2189c131b5caed737aa6706d4a8d7e1112b');