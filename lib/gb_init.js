const fs = require('fs');
const path = require('path');
const { runShell } = require('./gb_shell');
const brain = require('./brain');

async function initializeGitRepository(writer) {
  await runShell(null, 'git init');
  global.gitRootDirectory = process.cwd();
  await runShell(null, 'git switch -C main');
  await runShell(writer, 'git config core.ignorecase true');
  await runShell(writer, 'git config core.precomposeunicode true');
  await runShell(writer, 'git config filter.brain.clean "git-brain clean %f"');
  await runShell(writer, 'git config filter.brain.smudge "git-brain smudge %f"');
  await runShell(writer, 'cat .git/config');

  const brainDbDirectory = path.join(global.gitRootDirectory, '.brain', 'db');
  const brainDbFile = path.join(brainDbDirectory, 'v0');
  await brain.open(brainDbFile);

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
};
