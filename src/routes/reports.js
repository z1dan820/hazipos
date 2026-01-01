const express = require('express');
const router = express.Router();
const db = require('../database');

// AMBIL RINGKASAN LAPORAN (GET /api/reports/summary)
router.get('/summary', (req, res) => {
    const sql = `
        SELECT 
            COUNT(id) as total_transaksi,
            SUM(total_amount) as total_omzet,
            SUM(total_profit) as total_laba
        FROM sales 
        WHERE date(created_at) = date('now', 'localtime')
    `;
    db.get(sql, [], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(row || { total_transaksi: 0, total_omzet: 0, total_laba: 0 });
    });
});

// AMBIL DAFTAR TRANSAKSI TERAKHIR
router.get('/recent', (req, res) => {
    const sql = "SELECT * FROM sales ORDER BY created_at DESC LIMIT 10";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;