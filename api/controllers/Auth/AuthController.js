const User = require('../../models/User/User');
const authService = require('../../services/auth.service');
const bcryptService = require('../../services/bcrypt.service');

const AuthController = () => {
  const register = (req, res) => {
    const body = req.body;


    if (body.password === body.password2) {
      return User.create({
        email: body.email,
        password: body.password,
      })
        .then((user) => {
          const token = authService.issue({ id: user.id });

          return res.status(200).json({ token, user });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ msg: 'Internal server error' });
        });
    }

    return res.status(400).json({ msg: 'Passwords don\'t match' });
  };

  const login = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (email && password) {
      User.findOne({
        where: {
          email,
        },
      })
        .then((user) => {
          if (!user) {
            return res.status(400).json({ msg: 'Bad Request: User not found' });
          }

          if (bcryptService.comparePassword(password, user.password)) {
            const token = authService.issue({ id: user.id });

            return res.status(200).json({ token, user });
          }

          return res.status(401).json({ msg: 'Unauthorized' });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ msg: 'Internal server error' });
        });
    }
  };

  const validate = (req, res) => {
    const tokenToVerify = req.body.token;

    authService.verify(tokenToVerify, (err) => {
      if (err) {
        return res.status(401).json({ isvalid: false, err: 'Invalid Token!' });
      }

      return res.status(200).json({ isvalid: true });
    });
  };

  return {
    register,
    login,
    validate,
  };
};

module.exports = AuthController;
