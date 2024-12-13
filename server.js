const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Konfigurasi database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Koneksi database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Middleware untuk verifikasi token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send({ auth: false, message: 'Token expired. Please login again.' });
            }
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }

        req.userId = decoded.id;
        next();
    });
}

// Middleware untuk mengecualikan endpoint publik
const publicPaths = ['/login', '/register'];

app.use((req, res, next) => {
    if (publicPaths.includes(req.path)) {
        return next();
    }
    verifyToken(req, res, next);
});

// Endpoint API
app.get('/', (req, res) => {
    res.send('Employee Management REST API - Protected');
});

// GET semua karyawan
app.get('/employees', (req, res) => {
    const sql = 'SELECT * FROM employees';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// GET karyawan berdasarkan ID
app.get('/employees/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM employees WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// POST tambah karyawan baru
app.post('/employees', (req, res) => {
    const { name, position, department, salary } = req.body;
    const sql = 'INSERT INTO employees (name, position, department, salary) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, position, department, salary], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, name, position, department, salary });
    });
});

// PUT update karyawan
app.put('/employees/:id', (req, res) => {
    const { id } = req.params;
    const { name, position, department, salary } = req.body;
    const sql = 'UPDATE employees SET name = ?, position = ?, department = ?, salary = ? WHERE id = ?';
    db.query(sql, [name, position, department, salary, id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Employee updated', id });
    });
});

// DELETE karyawan
app.delete('/employees/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM employees WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Employee deleted', id });
    });
});

// Register user
app.post(
    '/register',
    [
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, 8);

        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send({ message: 'Username already exists.' });
                }
                return res.status(500).send({ message: 'Error registering user.' });
            }
            res.status(201).send({ message: 'User registered successfully.' });
        });
    }
);

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send({ message: 'Error on the server.' });
        if (results.length === 0) return res.status(404).send({ message: 'User not found.' });

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({ auth: true, token });
    });
});

// Jalankan server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
