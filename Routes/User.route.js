const express = require('express');
const createHttpError = require('http-errors');
const route = express.Router();


const User = require('../Models/User.model');
const { userValidate } = require('../helpers/validation');
const {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../helpers/jwt_service');

route.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { error } = userValidate(req.body);
    if (error) {
      throw createHttpError(error.details[0].message);
    }

    const isExist = await User.findOne({ email });
    if (isExist) {
      throw createHttpError.Conflict(`${email} is ready been registed`);
    }

    const user = await User({
      email,
      password,
    });
    const savedUser = await user.save();

    return res.status(200).json({
      elements: savedUser,
    });
  } catch (error) {
    next(error);
  }
});
route.post('/refresh-token', async (req, res, next) => {
  try {
    console.log(req.body);
    const { refreshToken } = req.body;
    if (!refreshToken) throw createHttpError.BadRequest();

    const { userId } = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const newRefreshToken = await signRefreshToken(userId);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
});
route.post('/login', async (req, res, next) => {
  try {
    const { error } = userValidate(req.body);
    if (error) {
      throw createHttpError(error.details[0].message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw createHttpError.NotFound('User is not register');
    }

    const isValid = await user.isCheckPassword(password);
    if (!isValid) {
      throw createHttpError.Unauthorized();
    }
    const accessToken = await signAccessToken(user._id);
    const refreshToken = await signRefreshToken(user._id);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});
route.post('/logout', (req, res, next) => {
  res.send('function logout');
});
route.get('/getlists', verifyAccessToken, (req, res, next) => {
  console.log(req.headers);
  const listUsers = [
    {
      email: 'baonguyen',
    },
    {
      email: 'quynhanh',
    },
  ];
  res.json({ listUsers });
});

module.exports = route;
