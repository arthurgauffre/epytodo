const dotenv = require("dotenv").config();

const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

module.exports = { app };

const authrouter = require('./routes/auth/auth');
const userrouter = require('./routes/user/users');
const todorouter = require('./routes/todos/todos');

app.listen(PORT, function(error){
  if (error) console.log("Error in server setup")
  console.log(`Listening at http://localhost:${PORT}`);
})
