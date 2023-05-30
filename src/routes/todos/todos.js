const token = require("../../function/token");
const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const jsonwebtoken = require("jsonwebtoken");
const { app } = require("../..");

app.post("/todos", (req, res) => {
    const {title, description, due_time, user_id, status} = req.body;
    if (!title || !description || !due_time || !user_id || !status) {
        res.status(401).json({"msg": "Bad request"});
        return;
    }
    if (!token.check_token(req, res)) {
        return;
    }
    pool.execute(`SELECT * FROM user WHERE id = ?`, [user_id], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
            return;
        }
        if (result.length == 0) {
            res.status(401).json({"msg": "Bad request"});
            return;
        }
        pool.execute(`INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)`, [title, description, due_time, user_id, status], (error, result) => {
            if (error) {
                console.log(error);
                res.status(500).json({ msg: "Internal server error" });
            } else {
                pool.execute(`SELECT * FROM todo WHERE id = ?`, [result.insertId], (error, result) => {
                    if (error) {
                        console.log(error);
                        res.status(500).json({ msg: "Internal server error" });
                    } else {
                        res.status(201).json(result);
                    }
                });
            }
        });
    });
});

app.get("/todos", (req ,res) => {
    if (!token.check_token(req, res)) {
        return;
    }
    pool.execute(`SELECT * FROM todo`, (error ,result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
        } else {
            res.status(201).json(result);
        }
    });
});

app.get("/todos/:id", (req ,res) => {
    const id = req.params.id;
    if (!token.check_token(req, res)) {
        return;
    }
    pool.execute(`SELECT * FROM todo WHERE id = ?`, [id], (error ,result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
        } else {
            if (result.length == 0) {
                return res.status(401).json({ msg: "Not found" });
            }
            res.status(201).json(result);
        }
    });
});

app.delete("/todos/:id", (req, res) => {
    const id = req.params.id;
    if (!token.check_token(req, res))
        return;
    pool.execute("DELETE FROM todo WHERE id = ?", [id], (error, result) => {
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

app.put("/todos/:id", (req, res) => {
    if (!token.check_token(req, res))
        return;
    const {title, description, due_time, user_id, status} = req.body;
    const id  = req.params.id;
    if (!title || !description || !due_time || !user_id || !status) {
        res.status(400).json({"msg": "Bad request"});
        return;
    }
    pool.execute(`UPDATE todo SET title = ?, description = ?, due_time = ?, user_id = ?, status = ? WHERE id = ?`, [title, description, due_time, user_id, status, id], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
            return;
        } else {
            pool.execute("SELECT * FROM todo WHERE id = ?", [id], (error, result) => {
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
});

module.exports = router;