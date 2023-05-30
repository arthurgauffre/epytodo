const jwt = require("jsonwebtoken");
const token = jwt.sign({ foo: 'bar' }, 'shhhhh');
const dotenv = require("dotenv").config();
const db = require("db_connection");

function authToken(req, res, next) {
    jwt.verify(token, 'shhhhh', function(err, decoded) {
        console.log(decoded.foo)
    });
    jwt.verify(token, 'wrong-secret', function(err, decoded) {
        // err
        // decoded undefined
      });
}
