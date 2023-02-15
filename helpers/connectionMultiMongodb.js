const mongoose = require('mongoose');
require('dotenv').config();

function newConnection(uri) {
  const conn = mongoose.createConnection(uri);

  conn.on('connected', () => {
    console.log('MongoDB connected ' + conn.name);
  });

  conn.on('disconnected', () => {
    console.log('MongoDB disconnected ');
  });

  conn.on('error', (error) => {
    console.log(`MongoDB error ${JSON.stringify(error)}`);
  });
  return conn;
}

const userManageConnection = newConnection(process.env.URI_MONGODB_USER);

module.exports = {
  userManageConnection,
};
