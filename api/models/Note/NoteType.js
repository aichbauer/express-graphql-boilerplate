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
      resolve(note) {
        return note.id;
      },
    },
    UserId: {
      type: GraphQLInt,
      resolve(note) {
        return note.UserId;
      },
    },
    note: {
      type: GraphQLString,
      resolve(note) {
        return note.note;
      },
    },
    createdAt: {
      type: GraphQLString,
      resolve(note) {
        return note.createdAt;
      },
    },
    updatedAt: {
      type: GraphQLString,
      resolve(note) {
        return note.updatedAt;
      },
    },
  }),
});

module.exports = NoteType;
