const express = require('express');
const app = express();
const createError = require('http-errors');
require('dotenv').config();

const client = require('./helpers/connectionRedis');

client.set('key','another')

const UserRoute = require('./Routes/User.route');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res, next) => {
  res.send('Home page');
});

app.use('/user', UserRoute);

app.use((req, res, next) => {
  next(createError.NotFound('This route does not exist'));
});

app.use((err, req, res, next) => {
  res.json({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
