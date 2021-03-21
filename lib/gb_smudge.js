const { TextDecoder } = require('util');
const ms = require('memory-streams');
const aw = require('awaitify-stream');
const { Pointer } = require('./pointer');
const cache = require('./gb_cache');

async function smudgeInputToPointer(input) {
  let reader = aw.createReader(input);
  let pointer = new Pointer();
  const pointerString = new TextDecoder().decode(await reader.readAsync());
  pointer.parse(pointerString);

  return pointer;
}

async function smudgePointerToOutput(file, pointer, outputStream) {
  if (await cache.hasFile(pointer)) {
    let inputStream = cache.getFileReadStream(pointer);
    inputStream.on('data', (chunk) => {
      outputStream.write(chunk);
    });
  } else {
    outputStream.write(`
todo: implement here!! i do not have cache

1. export to cache directory from svn
2. stream to output from cache
`);
    // 1. export to cache directory from svn
    // 2. stream to output from cache
    //
    // cache.getFileReadStream(pointer).pipe(output);
  }
}

async function smudgeFilter(file, read, write) {
  let pointer = await smudgeInputToPointer(read);
  await smudgePointerToOutput(file, pointer, write);
}

async function runCommandSmudge(file) {
  await smudgeFilter(file, process.stdin, process.stdout);
}

module.exports = {
  runCommandSmudge,
  smudgeFilter,
  smudgeInputToPointer,
  smudgePointerToOutput,
};
