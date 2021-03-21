// caches
const fs = require('fs');
const path = require('path');

async function pushFile(file, pointer) {
  if (await hasFile(pointer)) {
    return true;
  }

  let dir = getBlobCacheDirectory(pointer.oid);
  fs.mkdirSync(dir, { recursive: true });

  let dest = path.join(dir, pointer.oid);
  fs.copyFileSync(file, dest);
  return true;
}

async function copyFromCache(pointer, file) {
  if (hasFile(pointer) == false) {
    return false;
  }

  let src = path.join(getBlobCacheDirectory(pointer.oid), pointer.oid);
  fs.copyFileSync(src, file);

  return true;
}

async function hasFile(pointer) {
  let file = getFilePath(pointer);
  try {
    let stat = fs.statSync(file);
    if (pointer.size != stat.size) {
      // hash are conflicted or logical bug
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

function getFilePath(pointer) {
  return path.join(getBlobCacheDirectory(pointer.oid), pointer.oid);
}

function getFileReadStream(pointer) {
  const readStream = new fs.createReadStream(
    path.join(getBlobCacheDirectory(pointer.oid), pointer.oid),
  );

  return readStream;
}

function getBlobCacheDirectory(oid) {
  return path.join(
    global.gitRootDirectory,
    '.brain',
    'objects',
    oid.substring(0, 2),
    oid.substring(2, 4),
  );
}

module.exports = {
  getBlobCacheDirectory,
  pushFile,
  copyFromCache,
  hasFile,
  getFileReadStream,
};
