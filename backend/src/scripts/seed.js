import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME || 'pmh_ims',
    });
    await conn.ping();
    await conn.end();
  } catch (err) {
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nMySQL login failed. Update backend/.env with your real credentials:');
      console.error('  DB_USER=root');
      console.error('  DB_PASSWORD=<your MySQL root password>');
      console.error('\nXAMPP/WAMP often use an empty password: DB_PASSWORD=\n');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('\nDatabase not found. Create it first:');
      console.error('  mysql -u root -p < database/schema.sql\n');
    }
    throw err;
  }
};

const seed = async () => {
  await testConnection();
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const staffHash = await bcrypt.hash('Staff@123', 10);

  await pool.query('DELETE FROM sale_items');
  await pool.query('DELETE FROM sales');
  await pool.query('DELETE FROM purchase_items');
  await pool.query('DELETE FROM purchases');
  await pool.query('DELETE FROM products');
  await pool.query('DELETE FROM suppliers');
  await pool.query('DELETE FROM users');

  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
    ['System Admin', 'admin@pmh.lk', adminHash, 'admin', 'Kamal Perera', 'staff@pmh.lk', staffHash, 'staff']
  );

  const [suppliers] = await pool.query(
    `INSERT INTO suppliers (name, contact, address) VALUES
     ('Colombo Auto Parts', '0771234567', '123, Galle Road, Colombo 03'),
     ('Lanka Spare Centre', '0112345678', '45, Kandy Road, Kadawatha'),
     ('Toyota Lanka Distributors', '0779876543', 'Industrial Zone, Horana')`
  );

  await pool.query(
    `INSERT INTO products (name, brand, vehicle_type, part_type, genuine_status, cost_price, selling_price, discount_price, stock_qty, reorder_level) VALUES
     ('Brake Pad Set Front', 'Toyota Genuine', 'Toyota Corolla 2015-2020', 'Genuine', 1, 14000, 18500, 17500, 24, 10),
     ('Oil Filter', 'Denso', 'Honda Civic FB', 'OEM', 1, 2100, 3200, 2900, 45, 15),
     ('Spark Plug Iridium', 'NGK', 'Nissan Sunny N17', 'OEM', 1, 3200, 4500, NULL, 8, 10),
     ('Air Filter', 'Mann', 'Suzuki Wagon R', 'Aftermarket', 0, 1800, 2800, 2500, 3, 8),
     ('Timing Belt Kit', 'Gates', 'Toyota Hilux Vigo', 'Aftermarket', 0, 16500, 22000, 20500, 6, 5),
     ('Headlight Bulb H4', 'Philips', 'Universal', 'Aftermarket', 0, 1200, 1800, 1600, 50, 20),
     ('Clutch Plate', 'Exedy', 'Mitsubishi Lancer', 'OEM', 1, 28000, 35000, 33000, 4, 5),
     ('Radiator Coolant 1L', 'Toyota', 'Universal', 'Genuine', 1, 1600, 2200, NULL, 30, 12)`
  );

  console.log('Seed completed successfully.');
  console.log('Admin: admin@pmh.lk / Admin@123');
  console.log('Staff: staff@pmh.lk / Staff@123');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
