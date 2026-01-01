const express = require('express');
const router = express.Router();
const db = require('../database'); // Ambil koneksi database yang sudah kita buat

// 1. AMBIL SEMUA PRODUK (GET /api/products)
router.get('/', (req, res) => {
    const sql = "SELECT * FROM products ORDER BY name ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

// 2. TAMBAH PRODUK BARU (POST /api/products)
router.post('/', (req, res) => {
    const { barcode, name, category, stock, cost_price, selling_price } = req.body;
    
    // Validasi sederhana
    if (!name || !selling_price) {
        return res.status(400).json({ error: "Nama dan Harga Jual wajib diisi!" });
    }

    const sql = `INSERT INTO products (barcode, name, category, stock, cost_price, selling_price) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [barcode, name, category, stock || 0, cost_price || 0, selling_price];

    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ 
            message: "Produk berhasil ditambahkan", 
            id: this.lastID,
            data: req.body 
        });
    });
});

// 3. EDIT PRODUK (PUT /api/products/:id)
router.put('/:id', (req, res) => {
    const { barcode, name, category, stock, cost_price, selling_price } = req.body;
    const sql = `UPDATE products SET 
                 barcode = ?, name = ?, category = ?, stock = ?, cost_price = ?, selling_price = ? 
                 WHERE id = ?`;
    const params = [barcode, name, category, stock, cost_price, selling_price, req.params.id];

    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Produk berhasil diperbarui" });
    });
});

// 4. HAPUS PRODUK (DELETE /api/products/:id)
router.delete('/:id', (req, res) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.run(sql, req.params.id, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Produk dihapus" });
    });
});

module.exports = router;