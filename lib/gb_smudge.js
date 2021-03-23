const { TextDecoder } = require('util');
const ms = require('memory-streams');
const aw = require('awaitify-stream');
const { Pointer } = require('./pointer');
const cache = require('./gb_cache');
const { runShell } = require('./gb_shell');
const brain = require('./brain');

async function smudgeInputToPointer(input) {
  const reader = aw.createReader(input);
  const pointer = new Pointer();
  const pointerString = new TextDecoder().decode(await reader.readAsync());
  pointer.parse(pointerString);

  return pointer;
}

async function smudgePointerToOutput(file, pointer, outputStream) {
  if (cache.hasFile(pointer)) {
    const inputStream = cache.getFileReadStream(pointer);
    inputStream.on('data', (chunk) => {
      outputStream.write(chunk);
    });
  } else {
    const info = await brain.load(pointer.oid);
    await runShell(
      null,
      `svn export -r ${info.revision} ${file} ${cache.getFilePath(pointer.oid)}`,
    );
    cache.getFileReadStream(pointer).pipe(outputStream);
  }
}

async function smudgeFilter(file, read, write) {
  const pointer = await smudgeInputToPointer(read);
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
