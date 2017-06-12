const {
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} = require('graphql');

const NoteType = require('../../models/Note/NoteType');
const Note = require('../../models/Note/Note');

const createNote = {
  type: NoteType,
  description: 'The mutation that allows you to create a new Note',
  args: {
    UserId: {
      name: 'UserId',
      type: new GraphQLNonNull(GraphQLInt),
    },
    note: {
      name: 'note',
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  resolve: (value, { UserId, note }) => (
    Note.create({
      UserId,
      note,
    })
  ),
};

const updateNote = {
  type: NoteType,
  description: 'The mutation that allows you to update an existing Note by Id',
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLInt),
    },
    UserId: {
      name: 'UserId',
      type: new GraphQLNonNull(GraphQLInt),
    },
    note: {
      name: 'note',
      type: GraphQLString,
    },
  },
  resolve: (value, { id, UserId, note }) => (
    Note.findById(id)
      .then((foundNote) => {
        if (!foundNote) {
          return 'User not found';
        }

        const thisUserid = UserId !== undefined ? UserId : foundNote.userid;
        const thisNote = note !== undefined ? note : foundNote.note;

        return foundNote.update({
          UserId: thisUserid,
          note: thisNote,
        });
      })
  ),
};

const deleteNote = {
  type: NoteType,
  description: 'The mutation that allows you to delete a existing Note by Id',
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
  resolve: (value, { id }) => (
    Note.delete().where({
      id,
    })
  ),
};

module.exports = {
  createNote,
  updateNote,
  deleteNote,
};
