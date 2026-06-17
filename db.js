const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
});

db.connect((err) => {
    if (err) {
        console.log("❌ DB Error:", err.message);
        // ❗ مهم: ما نطيحوش التطبيق
    } else {
        console.log("✅ MySQL Connected");
    }
});

module.exports = db;