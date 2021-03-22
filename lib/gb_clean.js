const crypto = require('crypto');
const { Pointer } = require('./pointer');
const cache = require('./gb_cache');
const brain = require('./brain');
const aw = require('awaitify-stream');

async function cleanFilter(input, output) {
  let fileSize = 0;
  let hashHex = crypto.createHash('sha256');
  let hash = '';

  function streamToPromise(stream) {
    return new Promise((resolve, reject) => {
      stream
        .on('error', (err) => {
          reject(false);
        })
        .on('data', (chunk) => {
          fileSize += chunk.length;
          hashHex.update(chunk);
        })
        .on('end', () => {
          hash = hashHex.digest('hex');
        })
        .on('end', () => {
          resolve(true);
        });
    });
  }

  if ((await streamToPromise(input)) == false) {
    return null;
  }

  let pointer = new Pointer({ oidType: 'sha256', oid: hash, size: fileSize });
  let writer = aw.createWriter(output);
  await writer.writeAsync(pointer.toPointerString());

  return pointer;
}

async function runCommandClean(file) {
  let pointer = await cleanFilter(process.stdin, process.stdout);
  console.error(`${file} ${pointer.toPointerString()}`);
  await cache.pushFile(file, pointer);
  brain.store(pointer.oid, { file: file, revision: null, sha1: null });
}

module.exports = {
  runCommandClean,
  cleanFilter,
};
