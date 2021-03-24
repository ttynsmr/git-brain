#!/usr/bin/env node

const cli = require('cac')();
const index = require('../lib/index');

async function setupBeforeCommand(options) {
  await index.initialize();
}

async function cleanupAfterCommand(options) {}

async function runCommand(options, command) {
  await setupBeforeCommand(options);
  await command(options);
  await cleanupAfterCommand(options);
}

(async () => {
  cli.command('init', 'Initialize').action((options) => {
    runCommand(options, () => {
      index.runCommandInit(options);
    });
  });

  cli.command('update', 'Update').action((options) => {
    runCommand(options, () => {
      index.runCommandUpdate(options);
    });
  });

  cli.command('prune', 'Prune').action(() => {
    console.log('prune here');
  });

  cli.command('clean [file]', 'Clean').action((file, options) => {
    runCommand(options, () => {
      index.runCommandClean(file);
    });
  });

  cli.command('smudge [file]', 'Smudge').action((file, options) => {
    runCommand(options, () => {
      index.runCommandSmudge(file);
    });
  });

  cli.command('info <type>', 'Informations "repo", "brain"').action((type, options) => {
    runCommand(options, () => {
      index.runCommandInfo(type, options);
    });
  });

  cli
    .command('prune', 'prune')
    .option('-n, --dry-run', 'Dry run')
    .action((options) => {
      runCommand(options, () => {
        index.runCommandPrune(options);
      });
    });

  cli.help();
  cli.parse();
})();
