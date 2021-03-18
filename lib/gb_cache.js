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

async function pullFile(pointer, file) {
  if (hasFile(pointer.oid) == false) {
    return false;
  }

  let src = path.join(getBlobCacheDirectory(pointer.oid), pointer.oid);
  fs.copyFileSync(src, file);
}

async function hasFile(pointer) {
  let file = path.join(getBlobCacheDirectory(pointer.oid), pointer.oid);
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
  pullFile,
  hasFile,
};
