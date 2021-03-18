const crypto = require('crypto');
const { Pointer } = require('./pointer');
const cache = require('./gb_cache');

async function cleanFilter(input, output) {
  let fileSize = 0;
  let hashHex = crypto.createHash('sha256');
  let hash = '';

  function streamToPromise(stream) {
    return new Promise((resolve, reject) => {
      stream
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

  await streamToPromise(input);

  let pointer = new Pointer({ oidType: 'sha256', oid: hash, size: fileSize });
  output.write(pointer.toPointerString());

  return pointer;
}

async function runCommandClean(file) {
  let pointer = await cleanFilter(process.stdin, process.stdout);
  cache.pushFile(file, pointer);
}

module.exports = {
  runCommandClean,
  cleanFilter,
};
