const { runShell } = require('./gb_shell');
const { update } = require('./gb_update');

async function runCommandFetch() {
  const currentBranch = (await runShell(null, 'git symbolic-ref --short HEAD')).trim();
  await runShell(null, 'git stash --include-untracked');
  await runShell(null, 'git switch main');
  await update();
  await runShell(null, `git switch ${currentBranch}`);
  const hasStash = (await runShell(null, 'git stash list')).trim().includes('¥n');
  if (hasStash) {
    await runShell(null, 'git stash pop');
  }
}

module.exports = { runCommandFetch };
