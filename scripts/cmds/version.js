const { version } = require('../../package.json');

const command = 'version';

const aliases = ['v'];

const desc = 'Show the current version number';

/* istanbul ignore next */
const handler = () => console.info(`express-graphql-boilerplate version ${version}`);

module.exports = {
  command,
  aliases,
  desc,
  handler,
};
