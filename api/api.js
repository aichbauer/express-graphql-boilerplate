/**
 * third party libraries
 */
const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const mapRoutes = require('express-routes-mapper');
const GraphHTTP = require('express-graphql');

/**
 * server configuration
 */
const config = require('../config/');
const database = require('../config/database');
const auth = require('./policies/auth.policy');
const Schema = require('./controllers/');
const User = require('./models/User/User');
const Note = require('./models/Note/Note');

// environment: development, testing, production
const environment = process.env.NODE_ENV;

/**
 * express application
 */
const api = express();
const server = http.Server(api);
const mappedRoutes = mapRoutes(config.publicRoutes, 'api/controllers/Auth/');

// secure express app
api.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));

// parsing the request bodys
api.use(bodyParser.urlencoded({ extended: false }));
api.use(bodyParser.json());

// public REST API
api.use('/rest', mappedRoutes);

// private GraphQL API
api.all('/graphql', (req, res, next) => auth(req, res, next));
api.get('/graphql', GraphHTTP({
  schema: Schema,
  pretty: true,
  graphiql: false,
}));
api.post('/graphql', GraphHTTP({
  schema: Schema,
  pretty: true,
  graphiql: false,
}));

api.get('/user', (req, res) => {
  User.findAll({}).then((users) => res.status(200).json(users));
});

api.get('/note', (req, res) => {
  Note.findAll({}).then((notes) => res.status(200).json(notes));
});

/**
 * Database
 *
 * uses the database for your environment
 * defined in config/connection.js (development, testing, production)
 *
 * default: drop db for development, keep for production
 * defined in config/index.js (keep)
 */
const DB = database
  .authenticate()
  .then(() => {
    if (environment === 'development' &&
      config.keep === false) {
      return database
        .drop()
        .then(() => (
          database
            .sync()
            .then(() => {
              console.log(`There we go ♕\nStarted in ${environment}\nGladly listening on http://127.0.0.1:${config.port}`);
              console.log('Connection to the database has been established successfully');
            })
            .catch((err) => console.error('Unable to connect to the database:', err))
        ))
        .catch((err) => console.error('Unable to connect to the database:', err));
    }

    // keep data in database after restart
    return database
      .sync()
      .then(() => {
        console.log(`There we go ♕\nStarted in ${environment}\nGladly listening on http://127.0.0.1:${config.port}`);
        console.log('Connection to the database has been established successfully');
      });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

server.listen(config.port, () => {
  if (environment !== 'production' &&
    environment !== 'development' &&
    environment !== 'testing'
  ) {
    console.error(`NODE_ENV is set to ${environment}, but only production and development are valid.`);
    process.exit(1);
  }
  return DB;
});
