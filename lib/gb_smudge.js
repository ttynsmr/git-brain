// TODO implement smudge

const Transform = require('stream').Transform;

async function filter(file, read, write) {
  await read.pipe(write);
}

async function runCommandSmudge(file) {
  console.error('implement smudge');
  await filter(process.stdin, process.stdout);
}

module.exports = {
  runCommandSmudge,
};
