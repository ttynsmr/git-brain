const { runShell } = require('./gb_shell');

async function update(options) {
  let writer = aw.createWriter(new ms.WritableStream());
  await runShell(writer, 'svn update --xml');
}

async function runCommandUpdate(options) {
  await options;
}

module.exports = { runCommandUpdate };
