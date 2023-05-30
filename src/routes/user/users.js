const express = require("express");
const router = express.Router();
const is_log = require("../../function/token");
const pool = require("../../config/db");
const { check_token } = require("../../function/token");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const { app } = require("../..");

const mysql = require('mysql2');

app.put("/users/:id", (req, res) => {
    if (!is_log.check_token(req, res))
        return;
    const {email, password, firstname, name} = req.body;
    const { id } = req.params;
    if (!email || !password || !firstname || !name) {
        res.status(400).json({"msg": "Bad request"});
        return;
    }
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
                    pool.execute(`UPDATE user SET name = ?, email = ?, password = ?, firstname = ? WHERE id = ?`, [name, email, hash, firstname, id], (error, result) => {
                        if (error) {
                            console.log(error);
                            res.status(500).json({ msg: "Internal server error" });
                            return;
                        } else {
                            pool.execute("SELECT * FROM user WHERE id = ?", [id], (error, result) => {
                                if (error) {
                                    console.log(error);
                                    res.status(500).json({ msg: "Internal server error" });
                                    return;
                                } else if (result.length === 0){
                                    res.status(404).json({ msg: "Not found" });
                                } else {
                                    const updatedUser = result[0];
                                    res.status(200).json(updatedUser);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

app.delete("/users/:id", (req, res) => {
    if (!is_log.check_token(req, res))
        return;
    const { id } = req.params;
    pool.execute("DELETE FROM user WHERE id = ?", [id], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
            return;
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({ msg: "Not found" }); 
            } else {
                const message = `Successfully deleted record number: ${id}`;
                res.json({ msg: message});
            }
        }
    });
});

app.get("/user", (req, res) => {
    const parsed_token = is_log.check_token(req, res);
    if (!parsed_token)
        return;
    pool.execute(`SELECT * FROM user WHERE id = ?`, [parsed_token.id],(error, result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
            return;
        } else {
            if (result.length === 0) {
                res.status(404).json({ msg: "Not found" });
                return;
            }
            res.status(200).json(result);
        }
    });
});

const user_info = (res, result) => {
    res.status(200).json(result);
}

app.get("/users/:id", (req, res) => {
    if (!is_log.check_token(req, res))
        return;
    const {id} = req.body;
    if (!id) {
        res.status(400).json({"msg": "Bad request"});
        return;
    }
    pool.execute(`SELECT * FROM user WHERE email = ?`, [id], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
        } else {
            if (result.length !== 0) {
                user_info(res, result);
            } else {
                res.status(401).json({ msg: "Not found" });
            }
        }
    });
});

app.get("/users/:email", (req, res) => {
    if (!is_log.check_token(req, res))
        return;
    const {email} = req.body;
    if (!email) {
        res.status(400).json({"msg": "Bad request"});
        return;
    }
    pool.execute(`SELECT * FROM user WHERE email = ?`, [email], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
        } else {
            if (result.length !== 0) {
                user_info(res, result);
            } else {
                res.status(401).json({ msg: "Not found" });
            }
        }
    });
});

app.get("/user/todos", (req, res) => {
    const user_tasks = is_log.check_token(req, res);
    if (!user_tasks) {
        return;
    }
    pool.execute(`SELECT * FROM todo WHERE user_id = ?`, [user_tasks.id], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
        } else {
            if (result.length !== 0) {
                res.status(200).json(result);
            } else {
                res.status(401).json({ msg: "Not found" });
            }
        }
    });
});
