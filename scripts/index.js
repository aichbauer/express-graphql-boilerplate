const yargs = require('yargs');

const { options } = require('./options');

yargs // eslint-disable-line
  .commandDir('cmds')
  .options(options)
  .demandCommand()
  .help()
  .argv;
