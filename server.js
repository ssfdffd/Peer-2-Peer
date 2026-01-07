const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;
app.listen(PORT);
// === 1. DATABASE CONNECTION ===
// This MUST come before any db.run or db.serialize calls
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error("❌ SQL Connection Error:", err.message);
    else console.log("✅ Connected to SQLite Database.");
});

// === 2. DATABASE INITIALIZATION ===
db.serialize(() => {
    console.log("🛠️ Initializing Tables...");

    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, surname TEXT, age INTEGER, phone TEXT,
        school TEXT, email TEXT UNIQUE, userType TEXT, password TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        paymentStatus TEXT DEFAULT "unpaid",
        school_id TEXT DEFAULT "public"
    )`);

    // Files Table
    db.run(`CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        originalName TEXT, displayName TEXT, date TEXT,
        uploadedBy TEXT, subject TEXT, school_id TEXT DEFAULT 'public',
        avgRating REAL DEFAULT 0.0
    )`);

    // Forum Questions Table
    db.run(`CREATE TABLE IF NOT EXISTS forum (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userName TEXT, text TEXT, date TEXT, school_id TEXT DEFAULT 'public'
    )`);

    // Forum Replies Table (Fixed questionId link)
    db.run(`CREATE TABLE IF NOT EXISTS forum_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        questionId INTEGER,
        userName TEXT,
        replyText TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (questionId) REFERENCES forum(id)
    )`);

    // Notifications Table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipientName TEXT,
        senderName TEXT,
        message TEXT,
        isRead INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Live Sessions & Meetings
    db.run(`CREATE TABLE IF NOT EXISTS live_sessions (
        id INTEGER PRIMARY KEY DEFAULT 1, 
        link TEXT, active INTEGER DEFAULT 0, topic TEXT,
        tutorName TEXT, subject TEXT, school_id TEXT DEFAULT 'public'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tutorName TEXT, topic TEXT, subject TEXT,
        startTime DATETIME, link TEXT, school_id TEXT DEFAULT 'public'
    )`);

    // Run Migrations (Add columns if they don't exist in an old DB)
    db.run(`ALTER TABLE users ADD COLUMN paymentStatus TEXT DEFAULT "unpaid"`, (err) => {});
    db.run(`ALTER TABLE users ADD COLUMN school_id TEXT DEFAULT "public"`, (err) => {});
});

// === 3. MIDDLEWARE ===
app.use(express.static('public'));
app.use(express.json());

// === 4. FILE UPLOAD CONFIG ===
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// === 5. AUTHENTICATION ROUTES ===
app.post('/api/signup', async (req, res) => {
    try {
        const { name, surname, age, phone, school, email, userType, password, schoolCode } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const s_id = schoolCode || 'public';
        const sql = `INSERT INTO users (name, surname, age, phone, school, email, userType, password, school_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [name, surname, age, phone, school, email, userType, hashedPassword, s_id], (err) => {
            if (err) return res.status(400).json({ message: "Registration failed!" });
            res.status(201).json({ message: "Success" });
        });
    } catch (e) { res.status(500).send(); }
});

app.post('/api/login', (req, res) => {
    const { name, password } = req.body;
    db.get(`SELECT * FROM users WHERE LOWER(name) = LOWER(?)`, [name], async (err, user) => {
        if (err || !user) return res.status(400).json({ message: "User not found!" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Wrong password!" });
        res.json({ name: user.name, userType: user.userType, school_id: user.school_id });
    });
});

// === 6. FORUM LOGIC (Questions & Answers) ===

// Post a Question
app.post('/api/forum/post', (req, res) => {
    const { userName, text, date, school_id } = req.body;
    db.run(`INSERT INTO forum (userName, text, date, school_id) VALUES (?, ?, ?, ?)`, 
    [userName, text, date, school_id || 'public'], function(err) {
        if (err) return res.status(500).send(err.message);
        res.json({ id: this.lastID });
    });
});

// Get all Questions
app.get('/api/forum/questions', (req, res) => {
    const s_id = req.query.school_id || 'public';
    db.all("SELECT * FROM forum WHERE school_id = ? OR school_id = 'public' ORDER BY id DESC", [s_id], (err, rows) => {
        res.json(rows || []);
    });
});

// Get all Replies for a specific Question
app.get('/api/forum/replies/:questionId', (req, res) => {
    const qId = req.params.questionId;
    db.all("SELECT * FROM forum_replies WHERE questionId = ? ORDER BY timestamp ASC", [qId], (err, rows) => {
        if (err) {
            console.error("Reply Fetch Error:", err);
            return res.status(500).json([]);
        }
        res.json(rows || []);
    });
});

// Post a Reply + Notify the original asker
app.post('/api/forum/reply', (req, res) => {
    const { questionId, senderName, replyText } = req.body;
    db.run(`INSERT INTO forum_replies (questionId, userName, replyText) VALUES (?, ?, ?)`, 
    [questionId, senderName, replyText], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        // Notification logic
        db.get("SELECT userName FROM forum WHERE id = ?", [questionId], (err, question) => {
            if (question && question.userName !== senderName) {
                const msg = `answered your question: "${replyText.substring(0, 30)}..."`;
                db.run(`INSERT INTO notifications (recipientName, senderName, message) VALUES (?, ?, ?)`,
                [question.userName, senderName, msg]);
            }
        });
        res.json({ success: true });
    });
});

// === 7. DELETE ROUTES ===
app.delete('/api/forum/question/:id', (req, res) => {
    const { id } = req.params;
    const { userName } = req.body;
    db.run("DELETE FROM forum WHERE id = ? AND userName = ?", [id, userName], function(err) {
        if (!err) db.run("DELETE FROM forum_replies WHERE questionId = ?", [id]);
        res.sendStatus(200);
    });
});

app.delete('/api/forum/reply/:id', (req, res) => {
    const { id } = req.params;
    const { userName } = req.body;
    db.run("DELETE FROM forum_replies WHERE id = ? AND userName = ?", [id, userName], () => res.sendStatus(200));
});

// === 8. NOTIFICATIONS & FILES ===
app.get('/api/notifications', (req, res) => {
    db.all("SELECT * FROM notifications WHERE recipientName = ? AND isRead = 0 ORDER BY timestamp DESC", 
    [req.query.name], (err, rows) => {
        res.json(rows || []);
    });
});

app.get('/api/files', (req, res) => {
    db.all(`SELECT * FROM files WHERE school_id = 'public'`, [], (err, rows) => res.json(rows || []));
});

app.get('/api/active-session', (req, res) => {
    db.get("SELECT * FROM live_sessions WHERE active = 1", (err, row) => res.json(row || { active: 0 }));
});

// === 9. START SERVER ===

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
