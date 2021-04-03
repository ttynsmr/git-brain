// 🧠git-brain

const fs = require('fs');
const path = require('path');
const vizion = require('vizion');
const findParentDir = require('find-parent-dir');

const brain = require('./brain');
const cache = require('./gb_cache');
const { runCommandInit } = require('./gb_init');
const { runCommandUpdate } = require('./gb_update');
const { runCommandClean } = require('./gb_clean');
const { runCommandSmudge } = require('./gb_smudge');
const { runCommandPrune } = require('./gb_prune');
const { runCommandFetch } = require('./gb_fetch.js');
const { runCommandStatus } = require('./gb_status.js');

async function searchSvnRoot(workspace) {
  try {
    return findParentDir.sync(path.resolve(workspace), '.svn');
  } catch (err) {
    console.error('error', err);
    return undefined;
  }
}

async function initialize() {
  global.svnRootDirectory = await searchSvnRoot('.');
  const brainDbFile = path.join(global.svnRootDirectory, '.brain', 'db', 'v0');
  if (fs.existsSync(brainDbFile)) {
    await brain.open(brainDbFile);
  }
}

async function showInfoRepo() {
  console.log(global.svnRootDirectory);

  function analyze() {
    return new Promise((resolve, reject) => {
      vizion.analyze(
        {
          folder: global.svnRootDirectory,
        },
        (err, meta) => {
          if (err) {
            reject(err);
          } else {
            resolve(meta);
          }
        },
      );
    });
  }

  console.log(
    await analyze().catch((err) => {
      console.log(err);
    }),
  );
}

async function showInfoCache() {
  const cacheFiles = await cache.getCacheFiles(
    path.join(global.svnRootDirectory, '.brain', 'objects'),
  );
  // eslint-disable-next-line no-restricted-syntax
  for await (const file of cacheFiles) {
    console.log(path.relative(process.cwd(), file));
  }
}

async function showInfoBrain() {
  // eslint-disable-next-line no-restricted-syntax
  for await (const data of brain.list()) {
    console.log(data.key, '=', data.value);
  }
}

async function runCommandInfo(type, options) {
  switch (type) {
    case 'repo':
      await showInfoRepo(options);
      break;

    case 'cache':
      await showInfoCache(options);
      break;

    case 'brain':
      await showInfoBrain(options);
      break;

    default:
      await showInfoRepo(options);
      break;
  }
}

module.exports = {
  initialize,
  runCommandInit,
  runCommandUpdate,
  runCommandClean,
  runCommandSmudge,
  runCommandInfo,
  runCommandPrune,
  runCommandFetch,
  runCommandStatus,
};
