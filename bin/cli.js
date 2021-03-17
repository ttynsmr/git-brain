#!/usr/bin/env node

const cli = require('cac')();
const index = require('../lib/index');

async function setupBeforeCommand(options) {
  await index.initialize();
}

async function cleanupAfterCommand(options) {}

async function runCommand(options, command) {
  await setupBeforeCommand(options);
  await command();
  await cleanupAfterCommand(options);
}

(async () => {
  cli.option('--', '--');
  cli.option('--a', '--');

  cli.command('init', 'Initialize').action((options) => {
    runCommand(options, () => {
      index.runCommandInit();
    });
  });

  cli.command('update', 'Update').action(() => {
    console.log('update here');
  });

  cli.command('prune', 'Prune').action(() => {
    console.log('prune here');
  });

  cli.command('clean [file]', 'Clean').action((file, options) => {
    runCommand(options, () => {
      index.runCommandClean(file);
    });
  });

  cli.command('smudge [file]', 'Smudge').action((file) => {
    console.log('smudge here');
  });

  cli.command('filter-process', 'Filter process').action(() => {
    console.log('filter-process here');
  });

  cli.command('info', 'Informations').action((options) => {
    runCommand(options, () => {
      index.runCommandInfo();
    });
  });

  cli.help();
  cli.parse();
})();
