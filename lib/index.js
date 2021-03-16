// 🧠git-brain

// const GitAttributes = require('git-attributes');
// const fs = require('fs').promises;
const path = require('path');
// const tempy = require('tempy');
// const inquirer = require('inquirer');
const vizion = require('vizion');
const findParentDir = require('find-parent-dir');
const globby = require('globby');
// const hasha = require('hasha');
// const jsdiff = require('diff');

const { Pointer } = require('./pointer');

let gitRootDirectory;

async function initialize() {
  gitRootDirectory = await searchGitRoot('.');
}

async function searchGitRoot(workspace) {
  try {
    return findParentDir.sync(path.resolve(workspace), '.git');
  } catch (err) {
    console.error('error', err);
  }
}

async function runCommandInfo() {
  console.log(gitRootDirectory);

  function analyze() {
    return new Promise((resolve, reject) => {
      vizion.analyze(
        {
          folder: gitRootDirectory,
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
  let a = new Pointer();
  console.log(a.toPointerString());

  console.log(
    await analyze().catch((err) => {
      console.log(err);
    }),
  );
}

module.exports = {
  initialize,
  runCommandInfo,
};
