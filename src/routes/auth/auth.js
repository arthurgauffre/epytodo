const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const { app } = require("../..");

const put_new_user_in_database = (email, password, name, firstname, res) => {
    bcrypt.genSalt(10, (error, salt) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
        } else {
            bcrypt.hash(password, salt, (error, hash) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ msg: "Internal server error" });
                } else {
                    pool.query(`INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)`, [email, hash, name, firstname], (error, result) => {
                        if (error) {
                            console.log(error);
                            res.status(500).json({ msg: "Internal server error" });
                        } else {
                            const token = jsonwebtoken.sign({ id: result.insertId, email: result.insertEmail }, process.env.SECRET, { expiresIn: "1h" });
                            res.status(201).json({ token: token });
                        }
                    });
                }
            });
        }
    });
};

app.post("/register", (req, res) => {
    const {email, password, name, firstname} = req.body;

    if (!email || !password || !name || !firstname) {
        res.status(400).json({"msg": "Bad request"});
        return;
    }

    pool.execute(`SELECT * FROM user WHERE email = ?`, [email], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
            return;
        } 

        if (result.length !== 0) {
            res.status(401).json({ msg: "Account already exists" });
            return;
        }
        put_new_user_in_database(email, password, name, firstname, res);
    });
});

const login_user = (password, res, result) => {
    bcrypt.compare(password, result[0].password, (error, good_password) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
        } else {
            if (good_password) {
                const token = jsonwebtoken.sign({ id: result[0].id }, process.env.SECRET, { expiresIn: "1h" });
                res.status(201).json({ token: token });
              } else {
                res.status(401).json({ msg: "Invalid Credentials" });
            }
        }
    });
};

app.post("/login/", (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        res.status(401).json({"msg": "Bad request"});
        return;
    }
    pool.execute(`SELECT * FROM user WHERE email = ?`, [email], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
        } else {
            if (result.length !== 0) {
                login_user(password, res, result);
            } else {
                res.status(401).json({ msg: "Invalid Credentials" });
            }
        }
    });
});


module.exports = router;