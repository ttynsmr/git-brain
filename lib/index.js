// 🧠git-brain

// const GitAttributes = require('git-attributes');
// const fs = require('fs').promises;
const path = require('path');
// const tempy = require('tempy');
// const inquirer = require('inquirer');
const vizion = require('vizion');
const findParentDir = require('find-parent-dir');
// const globby = require('globby');
// const jsdiff = require('diff');

const { runCommandInit } = require('./gb_init');
const { runCommandUpdate } = require('./gb_update');
const { runCommandClean } = require('./gb_clean');
const { runCommandSmudge } = require('./gb_smudge');

async function initialize() {
  global.gitRootDirectory = await searchGitRoot('.');
}

async function searchGitRoot(workspace) {
  try {
    return findParentDir.sync(path.resolve(workspace), '.git');
  } catch (err) {
    console.error('error', err);
    return undefined;
  }
}

async function runCommandInfo() {
  console.log(global.gitRootDirectory);

  function analyze() {
    return new Promise((resolve, reject) => {
      vizion.analyze(
        {
          folder: global.gitRootDirectory,
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

module.exports = {
  initialize,
  runCommandInit,
  runCommandUpdate,
  runCommandClean,
  runCommandSmudge,
  runCommandInfo,
};
