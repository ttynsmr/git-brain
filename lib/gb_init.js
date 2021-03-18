const fs = require('fs');
const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);

async function runShell(options, commands) {
  if (options.runTest) {
    console.log((await exec(commands)).stdout);
  } else {
    await exec(commands);
  }
}

//rm -rf .git .gitattribute zxc.bin ; git-brain init --run-test
async function runCommandInit(options) {
  if (fs.existsSync('.git')) {
    console.log('🧠already has git');
    return false;
  }
  if (fs.existsSync('.brain_lock')) {
    console.log('🧠locked');
    return false;
  }
  console.log('🧠init process');
  await runShell(options, 'git init');
  await runShell(options, 'git config filter.brain.clean "git-brain clean %f"');
  await runShell(options, 'git config filter.brain.smudge "git-brain smudge %f"');
  await runShell(options, 'cat .git/config');

  if (options.runTest) {
    await runShell(
      options,
      'echo "*.bin filter=brain diff=brain merge=brain -text" > .gitattributes',
    );
    await runShell(options, 'echo "this text as bin" > zxc.bin');
    await runShell(options, 'git status');
    await runShell(options, 'git add .');
    await runShell(options, 'git status');
    await runShell(options, 'git commit -m "Initial commit"');
    await runShell(options, 'git show');
    await runShell(options, 'cat zxc.bin');
    await runShell(options, 'find .brain');
  }

  return true;
}

module.exports = {
  runCommandInit,
};
