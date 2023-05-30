const jsonwebtoken = require("jsonwebtoken");

function check_token(req, res) {
    const simple_token = req.headers.authorization;
    if (!simple_token) {
        res.status(401).json({"msg": "No token , authorization denied"});
        return false;
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        res.status(401).json({"msg": "No token , authorization denied"});
        return false;
    }
    const clear_token = jsonwebtoken.verify(token, process.env.SECRET, (error, result) => {
        if (!result) {
            res.status(401).json({ msg: "Token is not valid" });
            return false;
        }
        return result;
    });
    return clear_token;
}


module.exports = { check_token };
