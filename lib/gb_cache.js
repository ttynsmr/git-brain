// caches
const fs = require('fs');
const path = require('path');

async function pushFile(file, pointer) {
  if (hasFile(pointer)) {
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

function hasFile(pointer) {
  let file = getFilePath(pointer.oid);
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

function getFilePath(oid) {
  return path.join(getBlobCacheDirectory(oid), oid);
}

function getFileReadStream(pointer) {
  const readStream = new fs.createReadStream(
    path.join(getBlobCacheDirectory(pointer.oid), pointer.oid),
  );

  return readStream;
}

function getBlobCacheDirectory(oid) {
  return path.join(
    global.svnRootDirectory,
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
  getFilePath,
};
