const { cleanProject } = require('../tasks');

const command = 'clean';

const aliases = ['cleanup, clear'];

const desc = 'Clear the project to start working';

const handler = () => cleanProject();

module.exports = {
  command,
  aliases,
  desc,
  handler,
};
