const path = require('path');
const fs = require('fs-extra');

const cwd = process.cwd();
const apiDir = path.join(cwd, 'api');
const config = path.join(cwd, 'config');
const templates = path.join(cwd, 'scripts', 'templates', 'cleanProject');

const cleanProject = () => {
  fs.removeSync(path.join(apiDir, 'controllers'));
  fs.removeSync(path.join(apiDir, 'graphql'));
  fs.removeSync(path.join(apiDir, 'models'));
  fs.removeSync(path.join(config, 'routes'));

  fs.copySync(path.join(templates, 'api', 'controllers'), path.join(apiDir, 'controllers'));
  fs.copySync(path.join(templates, 'api', 'graphql'), path.join(apiDir, 'graphql'));
  fs.copySync(path.join(templates, 'api', 'models'), path.join(apiDir, 'models'));
  fs.copySync(path.join(templates, 'config', 'routes'), path.join(config, 'routes'));
};

module.exports = { cleanProject };
