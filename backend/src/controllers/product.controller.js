import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const getProducts = async (req, res, next) => {
  try {
    const { search, low_stock } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR brand LIKE ? OR vehicle_type LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (low_stock === 'true') {
      sql += ' AND stock_qty <= reorder_level';
    }
    sql += ' ORDER BY name ASC';

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows[0]) return next(new AppError('Product not found', 404));
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      vehicle_type,
      part_type,
      genuine_status = 0,
      cost_price,
      selling_price,
      discount_price,
      stock_qty = 0,
      reorder_level = 5,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO products (name, brand, vehicle_type, part_type, genuine_status, cost_price, selling_price, discount_price, stock_qty, reorder_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, brand, vehicle_type, part_type, genuine_status ? 1 : 0, cost_price, selling_price, discount_price || null, stock_qty, reorder_level]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      brand,
      vehicle_type,
      part_type,
      genuine_status,
      cost_price,
      selling_price,
      discount_price,
      stock_qty,
      reorder_level,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE products SET name=?, brand=?, vehicle_type=?, part_type=?, genuine_status=?, cost_price=?, selling_price=?, discount_price=?, stock_qty=?, reorder_level=?
       WHERE id=?`,
      [name, brand, vehicle_type, part_type, genuine_status ? 1 : 0, cost_price, selling_price, discount_price || null, stock_qty, reorder_level, id]
    );
    if (!result.affectedRows) return next(new AppError('Product not found', 404));

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return next(new AppError('Product not found', 404));
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

export const getLowStock = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE stock_qty <= reorder_level ORDER BY stock_qty ASC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};
