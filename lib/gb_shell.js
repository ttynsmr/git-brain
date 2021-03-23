const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);

async function runShell(writer, commands) {
  let str = (await exec(commands)).stdout;
  if (writer) {
    await writer.writeAsync(str);
  }
  return str;
}

module.exports = {
  runShell,
};
