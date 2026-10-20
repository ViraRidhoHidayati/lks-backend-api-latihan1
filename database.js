const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Gagal terhubung ke database SQLite:', err.message);
    } else {
        console.log('Terhubung ke database SQLite.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Tabel Users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'cashier'
        )`, () => {
            // Seeding default user (admin / 123456)
            db.get(`SELECT COUNT(*) as count FROM users`, async (err, row) => {
                if (row.count === 0) {
                    const hashedPassword = await bcrypt.hash('123456', 10);
                    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, 
                        ['admin', hashedPassword, 'admin']);
                    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, 
                        ['kasir1', await bcrypt.hash('123456', 10), 'cashier']);
                    console.log('Default users seeded: admin / kasir1 (password: 123456)');
                }
            });
        });

        // Tabel Products
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            image_url TEXT NOT NULL
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
                if (row.count === 0) {
                    const sampleProducts = [
                        ['Minyak Goreng 2L', 'Sembako', 35000, 50, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500'],
                        ['Beras Premium 5kg', 'Sembako', 65000, 30, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'],
                        ['Gula Pasir 1kg', 'Sembako', 15000, 100, 'https://images.unsplash.com/photo-1581441363689-1f3c3c3b02aa?w=500'],
                        ['Sabun Mandi Cair', 'Kesehatan & Kecantikan', 18000, 45, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'],
                        ['Shampoo Anti Ketombe', 'Kesehatan & Kecantikan', 25000, 25, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500']
                    ];
                    
                    const stmt = db.prepare(`INSERT INTO products (name, category, price, stock, image_url) VALUES (?, ?, ?, ?, ?)`);
                    sampleProducts.forEach(prod => stmt.run(prod));
                    stmt.finalize();
                    console.log('Sample products seeded.');
                }
            });
        });
    });
}

module.exports = db;