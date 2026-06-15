const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database: "todo_db",
    port: 3307,
});

db.connect((err) => {
    if (err) {
        console.log("❌ DB Error:", err.message);
    } else {
        console.log("✅ MySQL Connected");
    }
});

module.exports = db;