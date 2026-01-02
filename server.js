const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

// Import Database & Routes
const db = require('./src/database');
const productRoutes = require('./src/routes/products'); 
const salesRoutes = require('./src/routes/sales');
const reportRoutes = require('./src/routes/reports');
const settingsRoutes = require('./src/routes/settings');

const app = express();
const PORT = 3010;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/sales', salesRoutes);

// --- ROUTES ---
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// 1. Route Produk (Gudang)
app.use('/api/products', productRoutes);

// 2. Route Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(401).json({ error: "User tidak ditemukan" });
        
        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) return res.status(401).json({ error: "Password salah" });

        res.json({ 
            message: "Login sukses", 
            user: { id: user.id, username: user.username, role: user.role } 
        });
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`🚀 HaziPos System Berjalan di Port ${PORT}`);
    console.log(`📂 Penyimpanan Data Siap.`);
});
