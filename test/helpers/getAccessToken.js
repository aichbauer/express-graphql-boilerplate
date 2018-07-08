const authService = require('../../api/services/auth.service');
const User = require('../../api/models/User/User');

const getAccessToken = async (id) => {
  let token;
  if (id) {
    token = authService().issue({ id });

    return token;
  }

  const user = await User.create({
    username: 'test',
    email: `${Math.random(1 * Math.random(0.5))}testmail@testmail.com`,
    password: 'supersecurepassword',
  });

  token = authService().issue({ id: user.id });

  return token;
};

module.exports = {
  getAccessToken,
};
