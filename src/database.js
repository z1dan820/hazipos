const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// --- LOGIKA PENENTUAN PATH DATABASE (FIXED) ---
const SD_CARD_PATH = '/mnt/sdcard';
let dbPath;

// Cek apakah kita sedang di STB (Folder SD Card ada?)
if (fs.existsSync(SD_CARD_PATH)) {
    console.log("✅ SD Card terdeteksi. Menggunakan penyimpanan eksternal.");
    dbPath = path.join(SD_CARD_PATH, 'hazipos_core.db');
} else {
    console.warn("⚠️ SD Card tidak ditemukan (Mode Dev/Windows). Menggunakan folder lokal './data'.");
    // Pastikan folder data lokal ada
    const localDataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(localDataDir)) {
        fs.mkdirSync(localDataDir);
    }
    dbPath = path.join(localDataDir, 'hazipos_core.db');
}

// Koneksi Database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Gagal koneksi database:', err.message);
    } else {
        console.log(`✅ Database terhubung di: ${dbPath}`);
        initTables();
    }
});

function initTables() {
    db.serialize(() => {
        // 1. Tabel Users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'cashier',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 2. Tabel Produk
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT UNIQUE,
            name TEXT NOT NULL,
            category TEXT,
            stock INTEGER DEFAULT 0,
            cost_price INTEGER,
            selling_price INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 3. Tabel Penjualan
        db.run(`CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_no TEXT UNIQUE,
            cashier_name TEXT,
            total_amount INTEGER,
            total_profit INTEGER,
            payment_method TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 4. Tabel Detail Item
        db.run(`CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER,
            product_id INTEGER,
            product_name TEXT,
            qty INTEGER,
            cost_at_sale INTEGER,
            price_at_sale INTEGER,
            FOREIGN KEY(sale_id) REFERENCES sales(id)
        )`);
        
        // ... kode tabel lainnya ...

// 5. Tabel Kategori (BARU)
db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
)`);

// Masukkan kategori default jika kosong
db.get("SELECT count(*) as count FROM categories", (err, row) => {
    if (row && row.count === 0) {
        const stmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
        ['Umum', 'Makanan', 'Minuman', 'Sembako', 'Rokok', 'Pulsa', 'Jasa'].forEach(c => stmt.run(c));
        stmt.finalize();
    }
});

        createDefaultAdmin();
    });
}

function createDefaultAdmin() {
    db.get("SELECT * FROM users WHERE role = 'admin'", (err, row) => {
        if (!row) {
            const defaultPass = 'hazipos';
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(defaultPass, salt);
            
            db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, 
                ['admin', hash, 'admin'], 
                (err) => {
                    if (!err) console.log("🔐 Akun DEFAULT dibuat: User='admin', Pass='hazipos'");
                }
            );
        }
    });
}

module.exports = db;