const fs = require('fs/promises');
const folderPath = './sample';
async function checkout(commitHash) {
    const listOfFilesToCreate = [];
    // store the commit hash in the refs folder
    await fs.writeFile('.gitj/HEAD', commitHash);
    const { data, error } = await getTreeHashFromCommit(commitHash);
    if (error) {
        console.log(error);
        process.exit(1);
        return;
    }
    const treeHash = data;
    // get tree file
    const baseTree = await convertTreeObject(treeHash, '', []);
    // clear the folder
    await removeAllFilesAndFolders(folderPath);
    // create the files and folders based on address on the blob
    console.log('baseTree:', baseTree);
    await createFilesAndFolders(baseTree, folderPath);
}

async function getTreeHashFromCommit(commitHash) {
    try {
        const commitContent = await fs.readFile(`.gitj/objects/${commitHash.slice(0, 2)}/${commitHash.slice(2)}`, 'utf-8');
        const array = commitContent.split('\n').map(e=> e.split(' '))
        const elem = array.find(e => e[0] === 'tree');
        return { data: elem[1], error: null };
    } catch (e) {
        // if it could not find the commit hash, it means that it is a branch
        if (e.code === 'ENOENT') {
            // Find the Branch Name
            try {
                const branchHash = await fs.readFile(`.gitj/refs/heads/${commitHash}`, 'utf-8');
                const commitContent = await fs.readFile(`.gitj/objects/${branchHash.slice(0, 2)}/${branchHash.slice(2)}`, 'utf-8');
                const array = commitContent.split('\n').map(e=> e.split(' '))
                const elem = array.find(e => e[0] === 'tree');
                return { error: null, data: elem[1] };
            } catch (error) {
                return { error: 'Branch or Commit not found' };
            }

        } else {
            return { error: 'Unkown Error' };
        }
    }
}

async function convertTreeObject(treeHash, folderPrefix = '', files = []) {
    const treeObject = await fs.readFile(`.gitj/objects/${treeHash.slice(0, 2)}/${treeHash.slice(2)}`, 'utf-8').catch(e => console.log('Convert Tree Object Error:', e));
    const array = treeObject.split('\n').map(e=> e.split(' '))
    for (const file of array) {
        if (!file || file.length < 2) continue;
        const [mode, type, hash, name] = file;
        if (type === 'tree') {
            await convertTreeObject(hash, folderPrefix + name + '/', files).catch(e => console.log('Convert Tree Object type Tree Error:', e));
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

checkout('master');