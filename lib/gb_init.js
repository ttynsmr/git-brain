const fs = require('fs');
const path = require('path');
const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);

async function runShell(writer, commands) {
  let str = (await exec(commands)).stdout;
  if (writer) {
    await writer.writeAsync(str);
  }
}

async function initializeGitRepository(writer) {
  await runShell(null, 'git init');
  global.gitRootDirectory = path.dirname(process.cwd());
  await runShell(writer, 'git config filter.brain.clean "git-brain clean %f"');
  await runShell(writer, 'git config filter.brain.smudge "git-brain smudge %f"');
  await runShell(writer, 'cat .git/config');

  return true;
}

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
  return initializeGitRepository(null);
}

module.exports = {
  runCommandInit,
  initializeGitRepository,
  runShell,
};
