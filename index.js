#!/usr/bin/env node

const { checkout } = require('./src/checkout');
const { init } = require('./src/init');
const { add } = require('./src/add');
const { commit } = require('./src/commit');

const yargs = require('yargs');
// should be able to init
// gitjs init =>

yargs
  .scriptName("gitjs-parser")
  .usage('$0 <cmd> [args]')
  .command('checkout [branch]', 'Checkout a branch', (yargs) => {
    yargs.positional('branch', {
      describe: 'Branch to checkout',
      type: 'string'
    });
  }, function (argv) {
    console.log('checkout', argv.branch);
    checkout(argv.branch);
  })
  .command('init [folder]', 'Initialize a new git repository', {}, function (argv) {
    yargs.positional('folder', {
      describe: 'Folder to initialize',
      type: 'string',
      default: '.'
    });
    // console.log('init', argv.folder);
    init();
  })
  .command('add [files..]', 'Add files to the staging area', (yargs) => {
      yargs.positional('files', {
          describe: 'Files to add',
          type: 'array'
        });
    }, function (argv) {
    console.log('add', yargs.files);
    add(argv.files);
  })
  .command('commit [message]', 'Commit changes', (yargs) => {
      yargs.positional('message', {
          describe: 'Commit message',
          type: 'string'
        });
    }, function (argv) {
    console.log('commit', yargs.message);
    commit(argv.message);
  })
  .help()
  .argv;