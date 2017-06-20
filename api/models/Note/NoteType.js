const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
} = require('graphql');

const NoteType = new GraphQLObjectType({
  name: 'Note',
  description: 'This represents a Note',
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: (note) => note.id,
    },
    UserId: {
      type: GraphQLInt,
      resolve: (note) => note.UserId,
    },
    note: {
      type: GraphQLString,
      resolve: (note) => note.note,
    },
    createdAt: {
      type: GraphQLString,
      resolve: (note) => note.createdAt,
    },
    updatedAt: {
      type: GraphQLString,
      resolve: (note) => note.createdAt,
    },
  }),
});

module.exports = NoteType;
