const express = require('express');
const router = express.Router();
const db = require('../database');

// SIMPAN TRANSAKSI BARU (POST /api/sales)
router.post('/', (req, res) => {
    const { invoice_no, cashier_name, total_amount, total_profit, payment_method, items } = req.body;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1. Masukkan ke Tabel Sales
        const stmtSale = db.prepare(`INSERT INTO sales (invoice_no, cashier_name, total_amount, total_profit, payment_method) VALUES (?, ?, ?, ?, ?)`);
        stmtSale.run([invoice_no, cashier_name, total_amount, total_profit, payment_method], function(err) {
            if (err) {
                db.run("ROLLBACK");
                return res.status(400).json({ error: err.message });
            }

            const saleId = this.lastID;

            // 2. Masukkan Item ke sale_items & Potong Stok
            const stmtItem = db.prepare(`INSERT INTO sale_items (sale_id, product_id, product_name, qty, cost_at_sale, price_at_sale) VALUES (?, ?, ?, ?, ?, ?)`);
            const stmtUpdateStock = db.prepare(`UPDATE products SET stock = stock - ? WHERE id = ?`);

            items.forEach(item => {
                stmtItem.run([saleId, item.id, item.name, item.qty, item.cost_price, item.selling_price]);
                stmtUpdateStock.run([item.qty, item.id]);
            });

            stmtItem.finalize();
            stmtUpdateStock.finalize();

            db.run("COMMIT", (err) => {
                if (err) return res.status(400).json({ error: "Gagal Commit Transaksi" });
                res.json({ message: "Transaksi Berhasil!", invoice_no });
            });
        });
    });
});

module.exports = router;