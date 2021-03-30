const crypto = require('crypto');
const { Pointer } = require('./pointer');
const cache = require('./gb_cache');
const brain = require('./brain');
const aw = require('awaitify-stream');
const hashHex = crypto.createHash('sha256');

async function cleanFilter(input, output) {
  const result = await Pointer.calcSha256HashFromStream(input);

  if (result.success == false) {
    return null;
  }

  const pointer = new Pointer({ oidType: 'sha256', oid: result.hash, size: result.fileSize });
  const writer = aw.createWriter(output);
  await writer.writeAsync(pointer.toPointerString());

  return pointer;
}

async function runCommandClean(file) {
  const pointer = await cleanFilter(process.stdin, process.stdout);
  await cache.pushFile(file, pointer);
  const cached = await brain.load(pointer.oid);
  if (!cached) {
    await brain.store(pointer.oid, { file: file, revision: null, sha1: null });
  }
}

module.exports = {
  runCommandClean,
  cleanFilter,
};
