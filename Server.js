require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;
app.use(cors());
app.use(express.json());
console.log("1 - before db");
const db = require("./db");
console.log("2 - before db");

app.get("/", (req, res) => {
    res.send("Backend Works");
});
app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            success: true,
            result
        });
    });
});
app.get("/tasks", auth, (req, res) => {

    const user_id = req.user.id;

    db.query(
        "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC", [user_id],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json(result);
        }
    );
});

app.post("/tasks", auth, (req, res) => {

    const { task } = req.body;

    const user_id = req.user.id; // من JWT

    db.query(
        "INSERT INTO tasks (task, user_id) VALUES (?, ?)", [task, user_id],
        (err) => {
            if (err) return res.status(500).json(err);

            db.query(
                "SELECT * FROM tasks WHERE user_id = ?", [user_id],
                (err2, result) => {
                    if (err2) return res.status(500).json(err2);
                    res.json(result);
                }
            );
        }
    );
});

app.put("/tasks/:id", auth, (req, res) => {
    const id = req.params.id;
    const { task } = req.body;

    if (!task || !String(task).trim()) {
        return res.status(400).json({ error: "task is required" });
    }

    const user_id = req.user.id;

    if (!user_id || !String(user_id).trim()) {
        return res.status(400).json({ error: "user_id is required" });
    }

    db.query(
        "UPDATE tasks SET task = ? WHERE id = ? AND user_id = ?", [task, id, user_id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });

            db.query(
                "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC", [user_id],
                (err2, result) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    res.json(result); // array
                }
            );
        }
    );
});

app.delete("/tasks/:id", auth, (req, res) => {
    const id = req.params.id;
    const user_id = req.user.id; // DELETE /tasks/:id?user_id=...

    if (!user_id || !String(user_id).trim()) {
        return res.status(400).json({ error: "user_id is required" });
    }

    db.query(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, user_id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });

            db.query(
                "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC", [user_id],
                (err2, result) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    res.json(result); // array
                }
            );
        }
    );
});
app.patch("/tasks/:id/complete", auth, (req, res) => {

    const id = req.params.id;
    const user_id = req.user.id;

    db.query(
        "UPDATE tasks SET completed = NOT completed WHERE id = ? AND user_id = ?", [id, user_id],
        (err) => {
            if (err) return res.status(500).json(err);

            db.query(
                "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC", [user_id],
                (err2, result) => {
                    if (err2) return res.status(500).json(err2);
                    res.json(result);
                }
            );
        }
    );
});

app.post("/signup", async(req, res) => {

    const {
        username,
        email,
        password
    } = req.body;

    try {

        const hashedPassword =
            await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (username,email,password) VALUES (?,?,?)", [username, email, hashedPassword],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true
                });

            }
        );

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});
app.post("/login", async(req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?", [email],
        async(err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (result.length === 0) {
                return res.json({
                    success: false,
                    message: "User not found"
                });
            }

            const user = result[0];

            const match = await bcrypt.compare(
                password,
                user.password
            );

            if (!match) {
                return res.json({
                    success: false,
                    message: "Wrong password"
                });
            }
            const token = jwt.sign({
                    id: user.id,
                    email: user.email
                },
                SECRET_KEY, {
                    expiresIn: "7d"
                }
            );
            res.json({
                success: true,
                token
            });

        }
    );

});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});