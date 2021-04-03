// caches
const fs = require('fs');
const path = require('path');

function getBlobCacheDirectory(oid) {
  return path.join(
    global.svnRootDirectory,
    '.brain',
    'objects',
    oid.substring(0, 2),
    oid.substring(2, 4),
  );
}

function getFilePath(oid) {
  return path.join(getBlobCacheDirectory(oid), oid);
}

function hasFile(pointer) {
  const file = getFilePath(pointer.oid);
  try {
    const stat = fs.statSync(file);
    if (pointer.size !== stat.size) {
      // hash are conflicted or logical bug
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

async function pushFile(file, pointer) {
  if (hasFile(pointer)) {
    return true;
  }

  const dir = getBlobCacheDirectory(pointer.oid);
  fs.mkdirSync(dir, { recursive: true });

  const dest = path.join(dir, pointer.oid);
  fs.copyFileSync(file, dest);
  return true;
}

async function copyFromCache(pointer, file) {
  if (hasFile(pointer) === false) {
    return false;
  }

  const src = path.join(getBlobCacheDirectory(pointer.oid), pointer.oid);
  fs.copyFileSync(src, file);

  return true;
}

function getFileReadStream(pointer) {
  // eslint-disable-next-line new-cap
  const readStream = new fs.createReadStream(
    path.join(getBlobCacheDirectory(pointer.oid), pointer.oid),
  );

  return readStream;
}

async function* getCacheFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  // eslint-disable-next-line no-restricted-syntax
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getCacheFiles(res);
    } else {
      yield res;
    }
  }
}

module.exports = {
  getBlobCacheDirectory,
  pushFile,
  copyFromCache,
  hasFile,
  getFileReadStream,
  getFilePath,
  getCacheFiles,
};
