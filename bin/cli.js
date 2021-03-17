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
  cli.command('init', 'Initialize').action(() => {
    console.log('init here');
  });

  cli.command('update', 'Update').action(() => {
    console.log('update here');
  });

  cli.command('prune', 'Prune').action(() => {
    console.log('prune here');
  });

  cli.command('clean [file]', 'Clean').action((file) => {
    console.log('clean here');
  });

  cli.command('smudge [file]', 'Smudge').action((file) => {
    console.log('smudge here');
  });

  cli.command('filter-process [file]', 'Filter process').action((file) => {
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
