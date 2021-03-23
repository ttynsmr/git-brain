const xml2js = require('xml2js');
const path = require('path');
const fs = require('fs');
const { runShell } = require('./gb_shell');
const brain = require('./brain');
const { Pointer } = require('./pointer');

async function update(options) {
  try {
    console.log(await runShell(null, 'git stash --include-untracked'));
    console.log(await runShell(null, 'svn update'));

    // 💩git-brain is called recursively through "clean filter" by "git add",
    // which opens leveldb twice and causes an error. So close it once.
    await global.db.close();

    console.log(await runShell(null, 'git add .'));

    var parser = new xml2js.Parser();
    const xml = await runShell(null, 'svn info --xml');
    const data = await parser.parseStringPromise(xml);
    console.log(
      await runShell(
        null,
        `git commit -m "pull from svn revision ${data.info.entry[0]['$'].revision}"`,
      ),
    );

    const commitedFiles = await (await runShell(null, `git show --pretty="format:" --name-only`))
      .split('\n')
      .filter((file) => file.length > 0);

    // 💩Then open it again.
    const brainDbFile = path.join(global.svnRootDirectory, '.brain', 'db', 'v0');
    if (fs.existsSync(brainDbFile)) {
      await brain.open(brainDbFile);
    }

    console.log(commitedFiles);
    commitedFiles.forEach(async (file) => {
      await brain.store(Pointer.calcSha256Hash(file), {
        file: file,
        revision: data.info.entry[0]['$'].revision,
        sha1: null,
      });
    });
    // console.log(`git commit -m "pull from svn revision ${data.info.entry[0]['$'].revision}"`);
  } catch (err) {
    console.error(err);
  } finally {
    console.log(await runShell(null, 'git stash pop'));
  }
}

async function runCommandUpdate(options) {
  await update(options);
}

module.exports = { runCommandUpdate };
