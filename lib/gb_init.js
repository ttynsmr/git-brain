const fs = require('fs');
const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);

async function runCommandInit() {
  if (fs.existsSync('.git')) {
    console.log('🧠already has git');
    return false;
  }
  if (fs.existsSync('.brain_lock')) {
    console.log('🧠locked');
    return false;
  }
  console.log('🧠init process');
  console.log((await exec('git init')).stdout);
  console.log((await exec('git config filter.brain.clean "git-brain clean %f"')).stdout);
  console.log((await exec('git config filter.brain.smudge "git-brain smudge %f"')).stdout);
  console.log((await exec('git config filter.brain.process "git-brain filter-process"')).stdout);
  console.log((await exec('cat .git/config')).stdout);
  console.log(
    (await exec('echo "*.bin filter=brain diff=brain merge=brain -text" > .gitattributes')).stdout,
  );
  console.log((await exec('echo "this text as bin" > zxc.bin')).stdout);
  // console.log((await exec('ls -la')).stdout);
  console.log((await exec('git status')).stdout);
  console.log((await exec('git add .')).stdout);
  console.log((await exec('git status && git commit -m "Initial commit" && git show')).stdout);
}

module.exports = {
  runCommandInit,
};
