const path = require('path');
const fs = require('fs').promises;
const brain = require('./brain');
const cache = require('./gb_cache');

async function runCommandPrune(options) {
  const cacheFiles = cache.getCacheFiles(path.join(global.svnRootDirectory, '.brain', 'objects'));
  // eslint-disable-next-line no-restricted-syntax
  for await (const file of cacheFiles) {
    const oid = path.basename(file);
    const cachedFileInfo = await brain.load(oid);
    if (!cachedFileInfo) {
      // console.log(oid + ' do not have brain memory');
      // eslint-disable-next-line no-continue
      continue;
    }
    if (!cachedFileInfo.revision) {
      // console.log(oid + ' do not have revision');
      // eslint-disable-next-line no-continue
      continue;
    }
    const deleteMessage = `Delete ${oid}, the cache of ${cachedFileInfo.file}.The original is in revision ${cachedFileInfo.revision} of the SVN repository.`;
    if (options.dryRun) {
      console.log(`DRYRUN: ${deleteMessage}`);
      // eslint-disable-next-line no-continue
      continue;
    }

    console.log(deleteMessage);
    fs.rm(file);
  }
}

module.exports = { runCommandPrune };
