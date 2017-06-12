const {
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} = require('graphql');

const UserType = require('../../models/User/UserType');
const User = require('../../models/User/User');

const updateUser = {
  type: UserType,
  description: 'The mutation that allows you to update an existing User by Id',
  args: {
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
  resolve: (user, { id, username, email }) => (
    User.findById(id)
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

const deleteUser = {
  type: UserType,
  description: 'The mutation that allows you to delete a existing User by Id',
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
  resolve: (user, { id }) => (
    User.delete().where({
      id,
    })
  ),
};

module.exports = {
  updateUser,
  deleteUser,
};
