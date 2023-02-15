const createHttpError = require('http-errors');
const JWT = require('jsonwebtoken');
const client = require('../helpers/connectionRedis');

const signAccessToken = async (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId,
    };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: '30m',
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const verifyAccessToken = (req, res, next) => {
  if (!req.headers['authorization']) {
    return next(createHttpError.Unauthorized());
  }
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader.split(' ');
  const token = bearerToken[1];
  //Start verify token
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) return next(createHttpError.Unauthorized(err.message));
    req.payload = payload;
    next();
  });
};

const signRefreshToken = async (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId,
    };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: '1y',
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      client.set(userId.toString(), token, 'EX', 365 * 24 * 60 * 60, (err, replay) => {
        if (err) return reject(createHttpError.InternalServerError());
        resolve(token);
      });
    });
  });
};

const verifyRefreshToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
      if (err) return reject(err);
      client.get(payload.userId, (err, replay) => {
        if (err) return reject(createHttpError.InternalServerError());
        if (refreshToken == replay) return resolve(payload);
        return reject(createHttpError.Unauthorized());
      });
    });
  });
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
