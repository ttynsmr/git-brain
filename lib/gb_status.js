const { runShell } = require('./gb_shell');

async function runCommandStatus(files) {
  console.log('> svn status');
  console.log(await runShell(null, `svn status ${files.join(' ')}`));
  console.log('> git status');
  console.log(await runShell(null, `git status ${files.join(' ')}`));
}

module.exports = { runCommandStatus };
