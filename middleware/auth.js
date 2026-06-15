const jwt = require("jsonwebtoken");

// Must match the token signing secret used in Taskdoback/Server.js
const SECRET_KEY = "taskdo_super_secret_key";

const auth = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ error: "No token" });

    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Invalid Authorization header" });
    }

    const token = parts[1];
    if (!token || !String(token).trim()) {
        return res.status(401).json({ error: "Empty token" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = auth;