const mongoose = require('mongoose');

const conn = mongoose.createConnection('mongodb://localhost:27017/userManage');

conn.on('connected', () => {
  console.log('MongoDB connected ' + conn.name);
});

conn.on('disconnected', () => {
  console.log('MongoDB disconnected ');
});

conn.on('error', (error) => {
  console.log(`MongoDB error ${JSON.stringify(error)}`);
});

process.on('SIGINT', async () => {
  await conn.close();
  process.exit(0);
});

module.exports = conn;
