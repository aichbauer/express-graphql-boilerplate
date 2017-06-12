const publicRoutes = require('./routes/publicRoutes');
const privateRoutes = require('./routes/privateRoutes');

module.exports = {
  keep: false,
  publicRoutes,
  privateRoutes,
  port: process.env.PORT || '3333',
};
