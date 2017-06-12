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
      resolve(user) {
        return user.id;
      },
    },
    username: {
      type: GraphQLString,
      resolve(user) {
        return user.username;
      },
    },
    email: {
      type: GraphQLString,
      resolve(user) {
        return user.email;
      },
    },
    notes: {
      type: new GraphQLList(NoteType),
      resolve(user) {
        return Note.findAll({
          where: {
            UserId: user.id,
          },
        });
      },
    },
    createdAt: {
      type: GraphQLString,
      resolve(user) {
        return user.createdAt;
      },
    },
    updatedAt: {
      type: GraphQLString,
      resolve(user) {
        return user.updatedAt;
      },
    },
  }),
});

module.exports = UserType;
