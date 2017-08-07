# express-graphql-boilerplate

> Express GraphQL API with JWT Authentication and support for sqlite, mysql, and postgresql

- authentication via [JWT](https://jwt.io/)
- support for [sqlite](https://www.sqlite.org/), [mysql](https://www.mysql.com/), and [postgresql](https://www.postgresql.org/)
- support for [graphiql](https://github.com/graphql/graphiql) an easy way exploring a GrapgQL API
- environments for `development`, `testing`, and `production`
- linting via [eslint](https://github.com/eslint/eslint)
- tests running with [AVA](https://github.com/avajs/ava)
- built with [npm sripts](#npm-scripts)
- examples for User, Note, and nested GraphQL Queries

## Quick Intro

GraphQL is a Query Language where your REST API can co-exist directly beside your GraphQL API in **harmony**. To demonstrate this we have two REST endpoints for `register` and `login`.

```sh
# clone repository
$ git clone https://github.com/aichbauer/express-graphql-boilerplate.git
# cd into project root
$ cd express-graphql-boilerplate
# install dependencies
$ npm i
# start application
$ npm start
# create a User via the REST API
curl -H "Content-Type: application/json" -X POST -d '{"username":"user","password":"pw"}' http://localhost:2017/rest/register
# login a User via the REST API
# you will get a JSON with a token and this is your token to get access to the GraphQL API
curl -H "Content-Type: application/json" -X POST -d '{"username":"user","password":"pw"}' http://localhost:2017/rest/login
# requesting a User via the GraphQL API
curl -i -H "Content-Type:application/json" -H "Authorization: Bearer <token>" -X POST -d '{"query": "{user{id, username}}"}'  http://localhost:2017/graphql
# creating a Note for a user via the GraphQL API
curl -i -H "Content-Type:application/json" -H "Authorization: Bearer <token>" -X POST -d '{"query": "mutation{createNote(UserId:1,note:\"this is a note\"){id,UserId,note}}"}' http://localhost:2017/graphql
# requesting a User with its Notes via the GraphQL API (nested Query)
curl -i -H "Content-Type:application/json" -H "Authorization: Bearer <token>" -X POST -d '{"query": "{user{id, username, notes{id, note}}}"}'  http://localhost:2017/graphql
```

## Table of Contents

- [Install & Use](#install-and-use)
- [Folder Structure](#folder-structure)
- [Controllers](#controllers)
  - [Create a Controller](#create-a-controller)
  - [Create a Query](#create-a-query)
  - [Create a Mutation](#create-a-mutation)
  - [RootQuery and Schema](#rootquery-and-schema)
- [Models](#models)
  - [Create a Model](#create-a-model)
  - [Create a Type](#create-a-type)
- [Policies](#policies)
  - [auth.policy](#authpolicy)
- [Services](#services)
- [Config](#config)
  - [Connection and Database](#connection-and-database)
- [Routes](#routes)
- [Test](#test)
  - [Setup](#setup)
- [npm scripts](#npm-scripts)

## Install and Use

Start by cloning this repository

```sh
# HTTPS
$ git clone https://github.com/aichbauer/express-graphql-boilerplate.git
```

then

```sh
# cd into project root
$ cd express-graphql-boilerplate
# install dependencies
$ yarn
# to use mysql
$ yarn add mysql2
# to use postgresql
$ yarn add pg pg-hstore
```

or

```sh
$ cd express-graphql-boilerplate
$ npm i
$ npm i mysql2 -S
$ npm i pg pg-hstore -S
```

sqlite is supported out of the box as it is the default.

## Folder Structure

This boilerplate has four main directories:

- api - for Controllers, Queries, Mutations, Models, Types, Services, etc.
- config - for routes, database, etc.
- db - this is only a directory for the sqlite database, the default for `NODE_ENV=development`
- test - using [AVA](https://github.com/avajs/ava)

## Controllers

This directory holds all Controllers. As a REST Controller does not vary much from a GraphQL Schema, they are also located inside of it. A **Query** and a **Mutation** in GraphQL has functions, so called **Resolvers** to modify a Model. Just like a **Controller** in a REST API has functions to modify a Model. The difference is that a function on a REST Controller is mapped to one specific route of your API, as if you have a **Query** or a **Mutation** in GraphQL all of your functions are mapped to only one route. The magic happens under the hood of GraphQL. When you send a **Query** to the server, GraphQL takes a look at your Query and takes a look at your Schema and only responds with the fields you requested in the Query. And this is also the point where you can make **nested Queries**, as GraphQL will simply take a look at what your **Query** looks like and the types it can use and responds with it.

You always have to keep in mind that a **Query** and a **Mutation** is the complete same for GraphQL, it does not differentiate between it until you pass it into `GraphQLSchema`. A **Query** has arguments, as a **Mutation** has arguments, you can use this arguments to resolve a function, most likely you would use this arguments to insert something into a database or to get entries from a database.

### Create a Controller

For an example with all CRUD operations visit the [express-rest-api-boilerplate](https://www.github.com/aichbauer/express-rest-api-boilerplate)

### Create a Query

> Note: You need to have a [Type](#create-a-type), and an existing [Model](#create-a-model) to use **Queries** in combination with a database!

Example **Query** for a User which lets you request all different fields which are defined in `args`.

```js
// import the reuired GraphQL Types
const {
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} = require('graphql');

// import the Model and the Type
const UserType = require('../../models/User/UserType');
const User = require('../../models/User/User');

// create the Query
const userQuery = {
  type: new GraphQLList(UserType), // the Type which it returns (an array of Users)
  args: {
    // arguments you are able to Query
    // notice no password field
    // so the password will not be send as respond
    // neither can you Query for it
    id: {
      name: 'id',
      type: GraphQLInt,
    },
    username: {
      name: 'username',
      type: GraphQLString,
    },
    email: {
      name: 'email',
      type: GraphQLString,
    },
    notes: {
      name: 'notes',
      type: GraphQLString,
    },
    createdAt: {
      name: 'createdAt',
      type: GraphQLString,
    },
    updatedAt: {
      name: 'updatedAt',
      type: GraphQLString,
    },
  },
  // how to get the respond
  // DB call
  resolve: (user, args) => User.findAll({ where: args }),
};

module.exports = userQuery;
```

### Create a Mutation

> Note: You need to have a [Type](#create-a-type), and an existing [Model](#create-a-model) to use **Mutations** in combination with a database!

```js
// import the required GraphQL Types
const {
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} = require('graphql');

// import Model and Type
const UserType = require('../../models/User/UserType');
const User = require('../../models/User/User');

// the update Mutation
const updateUser = {
  // the respond Type
  type: UserType,
  description: 'The Mutation that allows you to update an existing User by Id',
  args: {
    // arguments you can use
    // have to be fields that are
    // resolvable by the UserType
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLInt),
    },
    username: {
      name: 'username',
      type: GraphQLString,
    },
    email: {
      name: 'email',
      type: GraphQLString,
    },
  },
  // find the User in the DB
  // update the fields for this user
  resolve: (user, { id, username, email }) => (
    User
      .findById(id)
      .then((foundUser) => {
        if (!foundUser) {
          return 'User not found';
        }

        const thisUsername = username !== undefined ? username : foundUser.username;
        const thisEmail = email !== undefined ? email : foundUser.email;

        return foundUser.update({
          username: thisUsername,
          email: thisEmail,
        });
      })
  ),
};

// the update Mutation
const deleteUser = {
  // the respond Type
  type: UserType,
  description: 'The Mutation that allows you to delete a existing User by Id',
  // arguments you can use
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
  resolve: (user, { id }) => (
    User
      .delete()
      .where({
        id,
      })
  ),
};

module.exports = {
  updateUser,
  deleteUser,
};
```

## RootQuery and Schema

The Schema holds the RootQuery and the RootMutation which holds all the other Queries and Mutations, that is applied to one route which is your entrypoint for your GraphQL API. The Schema has to be exported and used in the `./api/api.js` file.

```js
// import required GraphQL Types
const {
  GraphQLSchema,
  GraphQLObjectType,
} = require('graphql');

// import Query and Mutations
const userQuery = require('./User/UserQuery');
const {
  updateUser,
  deleteUser,
} = require('./User/UserMutation');

// add Queries to RootQuery
const RootQuery = new GraphQLObjectType({
  name: 'rootQuery',
  description: 'This is the RootQuery which holds all possible READ entrypoints for the GraphQL API',
  fields: () => ({
    user: userQuery,
  }),
});

// add Mutations to RootMutations
const RootMutation = new GraphQLObjectType({
  name: 'rootMutation',
  description: 'This is the root Mutation which holds all possible WRITE entrypoints for the GraphQL API',
  fields: () => ({
    updateUser,
    deleteUser,
  }),
});

// add RootQuery and RootMutation
// to your Schema
const Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

module.exports = Schema;
```

To use the this Schema for your API we need to add it to a route.
If we set graphiql to `true` we get a nice webinterface to test our GraphQL Queries.

```js
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
```

The entrypoint for our GraphQL API is `http://localhost:2017/graphql`

## Models

### Create a Model

Controllers in this boilerplate have a naming convention: `Model.js` and uses [Sequelize](http://docs.sequelizejs.com/) to define our Models, if you want further information, read the [Docs](http://docs.sequelizejs.com/).

Example User Model:

```js
const Sequelize = require('sequelize');

// for encrypting our passwords
const bcryptSevice = require('../services/bcrypt.service');

// the DB connection
const sequelize = require('../../config/database');

// hooks are functions that can run before or after a specific event
const hooks = {
  beforeCreate(user) {
    user.password = bcryptSevice.password(user);
  },
};

// instanceMethods are functions that run on instances of our Model
// toJSON runs before delivering it to our client
// we delete the password, that the client has no sensitive data
const instanceMethods = {
  toJSON() {
    const values = Object.assign({}, this.get());

    delete values.password;

    return values;
  },
};

// naming the table in the DB
const tableName = 'users';

// the actual Model
const User = sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
  },
}, { hooks, instanceMethods, tableName });

module.exports = User;
```

### Create a Type

Types are necessary to let GraphQL know, how to resolve the different fields you provide in your Queries.

```js
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} = require('graphql');

const NoteType = require('../Note/NoteType');
const Note = require('../Note/Note');

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'This represents a User',
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: (user) => user.id,
    },
    username: {
      type: GraphQLString,
      resolve: (user) => user.username,
    },
    email: {
      type: GraphQLString,
      resolve: (user) => user.email,
    },
    notes: {
      type: new GraphQLList(NoteType),
      resolve: (user) => (
        Note
          .findAll({
            where: {
              UserId: user.id,
            },
          })
      ),
    },
    createdAt: {
      type: GraphQLString,
      resolve: (user) => user.createdAt,
    },
    updatedAt: {
      type: GraphQLString,
      resolve: (user) => user.updatedAt,
    },
  }),
});

module.exports = UserType;
```

## Policies

Policies are middleware functions that can run before hitting a specific or more specified route(s).

Example policy:

Only allow if the user is marked as admin.

> Note: this is not a secure example, only for presentation puposes

```js
module.exports = (req, res, next) => {
  if(req.body.userrole === 'admin') {
    // do some verification stuff
    const verified = verifyAdmin(req.body.userid);

    if(verified) {
      return next();
    }

    return res.status(401).json({ msg: 'Unauthorized' });
  }

  return res.status(401).json({ msg: 'Unauthorized' });
};
```

To use this policy on all routes that only admins are allowed:

api.js

```js
const adminPolicy = require('./policies/admin.policy');

app.all('/admin/*', (req, res, next) => adminPolicy(req, res, next));
```

Or for one specific route

api.js

```js
const adminPolicy = require('./policies/admin.policy');

app.get('/admin/myroute',
  (req, res, next) => adminPolicy(req, res, next),
  (req, res) => {
  //do some fancy stuff
});
```

## auth.policy

The `auth.policy` checks wether a [JSON Web Token](https://jwt.io/) is send in the header of an request as `Authorization: Bearer [JSON Web Token]` or inside of the body of an request as `token: [JSON Web Token]`.
The policy runs default on all API routes that are are prefixed with `/graphql`. To map multiple routes read the [express-routes-mapper docs](https://github.com/aichbauer/express-routes-mapper/blob/master/README.md).

To use this policy on all routes of a specific prefix:

app.js

```js
app.use('/prefix', yourRoutes);
app.all('/prefix', (req, res, next) => auth(req, res, next));
```

or to use this policy on one specific route:

app.js

```js
app.get('/specificRoute',
  (req, res, next) => auth(req, res, next),
  (req, res) => {
  // do some fancy stuff
});
```

## Services

Services are little useful snippets, or calls to another API that are not the main focus of your API.

Example service:

Get comments from another API:

```js
module.exports = {
  getComments: () => (
    fetch('https://jsonplaceholder.typicode.com/comments', {
      method: 'get'
    }).then(function(res) {
      // do some fancy stuff with the response
    }).catch(function(err) {
      // Error :(
    })
  );
};
```

## Config

Holds all the server configurations.

## Connection and Database

> Note: If you use mysql make sure mysql server is running on the machine

> Note: If you use postgresql make sure postgresql server is running on the machine

This two files are the way to establish a connaction to a database.

You only need to touch connection.js, default for `development` is sqlite, but it is easy as typing `mysql` or `postgres` to switch to another db.

> Note: To run a mysql db install these package with: `yarn add mysql2` or `npm i mysql2 -S`

> Note: To run a postgres db run these package with: `yarn add pg pg-hstore` or `npm i -S pg pg-hstore`

Now simple configure the keys with your credentials.

```js
{
  database: 'databasename',
  username: 'username',
  password: 'password',
  host: 'localhost',
  dialect: 'sqlite' || 'mysql' || 'postgres',
}
```

To not configure the production code.

To start the DB, add the credentials for production. Add `environment variables` by typing e.g. `export DB_USER=yourusername` before starting the API.

## Routes

> For an example REST API with routes visit [express-rest-api-boilerplate](https://www.github.com/aichbauer/express-rest-api-boilerplate)

Here you define all your routes for your API. It doesn't matter how you structure them. By default they are mapped on `privateRoutes` and `publicRoutes`. You can define as much routes files as you want e.g. for every Model or for specific use cases, e.g. normal user and admins.

## Test

All tests for this boilerplate uses [AVA](https://github.com/avajs/ava) and [supertest](https://github.com/visionmedia/superagent) for integration testing. So read their docs on further information.

## npm scripts

There are no automation tools or task runners like [grunt](https://gruntjs.com/) or [gulp](http://gulpjs.com/) used for this boilerplate. This boilerplate only uses npm scripts for automatization.

### npm start

This is the entry for a developer.

By default it uses a sqlite databse, if you want to migrate the sqlite database by each start, disable the `prestart` and `poststart` command. Also mind if you are using a sqlite database to delete the `drop-sqlite-db` in the prepush hook.

- runs a **nodemon watch task** for the all files in the project root
- sets the **environment variable** `NODE_ENV` to `development`
- opens the db connection for `development`
- starts the server on 127.0.0.1:2017

### npm test

This command:

- runs `npm run lint` ([eslint](http://eslint.org/)) with the [airbnb styleguide](https://github.com/airbnb/javascript) without arrow-parens rule for **better readability**
- sets the **environment variable** `NODE_ENV` to `testing`
- runs `nyc` the cli-tool for [istanbul](https://istanbul.js.org/) for test coverage
- runs `ava` for testing with [AVA](https://github.com/avajs/ava)

## npm run production

This command:

- sets the **environment variable** to `production`
- opens the db connection for `production`
- starts the server on 127.0.0.1:2017 or on 127.0.0.1:PORT_ENV

Before running on production you have to set the **environment vaiables**:

- DB_NAME - database name for production
- DB_USER - database username for production
- DB_PASS - database password for production
- DB_HOST - database host for production
- JWT_SECRET - secret for json web token

Optional:

- PORT - the port your API on 127.0.0.1, default to 2017

### other commands

- `npm run dev` - simply starts the server without a watch task
- `npm run creates-sqlite-db` - creates the sqlite database file
- `npm run drop-sqlite-db` - deletes the sqlite database file
- `npm run lint` - linting with [eslint](http://eslint.org/)
- `npm run nodemon` - same as `npm start`
- `npm run prepush` - a hook wich runs before pushing to a repository, runs `npm test` and `npm run drop-sqlite-db`
- `pretest` - runs linting before `npm test`
- `test-ci` - only runs tests, nothing in pretest, nothing in posttest, for better use with ci tools

## LICENSE

MIT © Lukas Aichbauer
