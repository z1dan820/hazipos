const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');

// === FITUR USER ===

// 1. Ambil Daftar User (Kecuali Password)
router.get('/users', (req, res) => {
    db.all("SELECT id, username, role, created_at FROM users", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

// 2. Registrasi User Baru
router.post('/users', (req, res) => {
    const { username, password, role } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hash, role], function(err) {
        if (err) return res.status(400).json({ error: "Username sudah digunakan!" });
        res.json({ message: "User berhasil dibuat", id: this.lastID });
    });
});

// 3. Ganti Password (Untuk User yang sedang login)
router.put('/users/password', (req, res) => {
    const { id, newPassword } = req.body;
    const hash = bcrypt.hashSync(newPassword, 10);
    db.run("UPDATE users SET password = ? WHERE id = ?", [hash, id], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Password berhasil diubah" });
    });
});

// 4. Hapus User
router.delete('/users/:id', (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", req.params.id, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "User dihapus" });
    });
});

// === FITUR KATEGORI ===

// 5. Ambil Kategori
router.get('/categories', (req, res) => {
    db.all("SELECT * FROM categories ORDER BY name ASC", [], (err, rows) => {
        res.json(rows);
    });
});

// 6. Tambah Kategori
router.post('/categories', (req, res) => {
    const { name } = req.body;
    db.run("INSERT INTO categories (name) VALUES (?)", [name], function(err) {
        if (err) return res.status(400).json({ error: "Gagal/Duplikat" });
        res.json({ id: this.lastID, name });
    });
});

// 7. Hapus Kategori
router.delete('/categories/:id', (req, res) => {
    db.run("DELETE FROM categories WHERE id = ?", req.params.id, (err) => {
        res.json({ message: "Terhapus" });
    });
});

module.exports = router;