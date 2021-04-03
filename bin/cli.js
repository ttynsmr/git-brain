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

  cli.command('info [type]', 'Informations "repo", "cache", "brain"').action((type, options) => {
    runCommand(options, () => {
      index.runCommandInfo(type, options);
    });
  });

  cli
    .command('prune', 'Prune caches')
    .option('-n, --dry-run', 'Dry run')
    .action((options) => {
      runCommand(options, () => {
        index.runCommandPrune(options);
      });
    });

  cli
    .command('fetch', 'fetch')
    .option('-n, --dry-run', 'Dry run')
    .action((options) => {
      runCommand(options, () => {
        index.runCommandFetch(options);
      });
    });

  cli
    .command('status [...files]', 'status')
    .option('-n, --dry-run', 'Dry run')
    .action((files, options) => {
      runCommand(options, () => {
        index.runCommandStatus(files, options);
      });
    });

  cli.help();
  cli.parse();
})();
