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
    console.log(await runShell(null, 'svn revert *'));

    // 💩git-brain is called recursively through "clean filter" by "git add",
    // which opens leveldb twice and causes an error. So close it once.
    await brain.close();

    console.log(await runShell(null, 'git add .'));

    const parser = new xml2js.Parser();
    const wcInfo = await parser.parseStringPromise(await runShell(null, 'svn info --xml'));
    console.log(
      await runShell(
        null,
        `git commit -m "pull from svn revision ${wcInfo.info.entry[0]['$'].revision}"`,
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

    const fileInfos = await parser.parseStringPromise(
      await runShell(null, `svn info --xml ${commitedFiles.join(' ')}`),
    );
    fileInfos.info.entry.forEach(async (entry) => {
      console.log('begin braining');

      console.log(await runShell(null, `cat ${entry['$'].path}`));
      if (fs.existsSync(entry['$'].path)) {
        console.log(`had ${entry['$'].path}`);
      }

      console.log(fs.readFileSync(entry['$'].path));

      const result = await Pointer.calcSha256Hash(entry['$'].path);
      await brain.store(result.hash, {
        file: entry['$'].path,
        revision: parseInt(entry['$'].revision),
        sha1: entry['wc-info'][0].checksum[0],
      });
      console.log('end braining');
    });
  } catch (err) {
    console.error(err);
  } finally {
    const hasStash = (await runShell(null, 'git stash list')).trim().includes('¥n');
    if (hasStash) {
      console.log(await runShell(null, 'git stash pop'));
    }
  }
}

async function runCommandUpdate(options) {
  await update(options);
}

module.exports = { runCommandUpdate, update };
