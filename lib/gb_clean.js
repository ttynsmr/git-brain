const Transform = require('stream').Transform;

const uppercase = new Transform({
  transform(chunk, encoding, done) {
    this.push(chunk.toString().toUpperCase());
    done();
  },
});

async function runCommandClean(file) {
  await process.stdin.pipe(uppercase).pipe(process.stdout);
}

module.exports = {
  runCommandClean,
};
