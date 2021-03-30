// 🧠git-brain

// const GitAttributes = require('git-attributes');
const fs = require('fs');
const path = require('path');
// const tempy = require('tempy');
// const inquirer = require('inquirer');
const vizion = require('vizion');
const findParentDir = require('find-parent-dir');
// const globby = require('globby');
// const jsdiff = require('diff');

const brain = require('./brain');
const { runShell } = require('./gb_shell');
const { runCommandInit } = require('./gb_init');
const { runCommandUpdate } = require('./gb_update');
const { runCommandClean } = require('./gb_clean');
const { runCommandSmudge } = require('./gb_smudge');
const { runCommandPrune } = require('./gb_prune');
const { runCommandFetch } = require('./gb_fetch.js');

async function initialize() {
  global.svnRootDirectory = await searchSvnRoot('.');
  const brainDbFile = path.join(global.svnRootDirectory, '.brain', 'db', 'v0');
  if (fs.existsSync(brainDbFile)) {
    await brain.open(brainDbFile);
  }
}

async function searchSvnRoot(workspace) {
  try {
    return findParentDir.sync(path.resolve(workspace), '.svn');
  } catch (err) {
    console.error('error', err);
    return undefined;
  }
}

async function runCommandInfo(type, options) {
  switch (type) {
    case 'repo':
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
      break;

    case 'cache':
      console.log(
        await runShell(
          null,
          `find ${path.join(global.svnRootDirectory, '.brain', 'objects')} -type f`,
        ),
      );
      break;

    case 'brain':
      for await (const data of brain.list()) {
        console.log(data.key, '=', data.value);
      }
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
};
