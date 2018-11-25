const bodyParser = require('body-parser');
const express = require('express');
const mapRoutes = require('express-routes-mapper');
const { ApolloServer } = require('apollo-server-express');

const config = require('../../config/');
const database = require('../../config/database');
const auth = require('../../api/policies/auth.policy');
const { schema } = require('../../api/graphql');

process.env.NODE_ENV = 'testing';

const beforeAction = async () => {
  const testapp = express();
  const mappedOpenRoutes = mapRoutes(config.publicRoutes, 'api/controllers/');

  testapp.use(bodyParser.urlencoded({ extended: false }));
  testapp.use(bodyParser.json());

  // public REST API
  testapp.use('/rest', mappedOpenRoutes);

  // private GraphQL API
  testapp.post('/graphql', (req, res, next) => auth(req, res, next));

  const graphQLServer = new ApolloServer({
    schema,
  });

  graphQLServer.applyMiddleware({
    app: testapp,
    cors: {
      origin: true,
      credentials: true,
      methods: ['POST'],
      allowedHeaders: [
        'X-Requested-With',
        'X-HTTP-Method-Override',
        'Content-Type',
        'Accept',
        'Authorization',
        'Access-Control-Allow-Origin',
      ],
    },
    playground: {
      settings: {
        'editor.theme': 'light',
      },
    },
  });

  await database.authenticate();
  await database.drop();
  await database.sync();

  console.log('Connection to the database has been established successfully');

  return testapp;
};

const afterAction = async () => {
  await database.close();
};


module.exports = {
  beforeAction,
  afterAction,
};
