import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const getSuppliers = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY name ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getSupplier = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (!rows[0]) return next(new AppError('Supplier not found', 404));
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const { name, contact, address } = req.body;
    const [result] = await pool.query(
      'INSERT INTO suppliers (name, contact, address) VALUES (?, ?, ?)',
      [name, contact, address || null]
    );
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contact, address } = req.body;
    const [result] = await pool.query(
      'UPDATE suppliers SET name=?, contact=?, address=? WHERE id=?',
      [name, contact, address || null, id]
    );
    if (!result.affectedRows) return next(new AppError('Supplier not found', 404));
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const [purchases] = await pool.query('SELECT id FROM purchases WHERE supplier_id = ? LIMIT 1', [
      req.params.id,
    ]);
    if (purchases.length) {
      return next(new AppError('Cannot delete supplier with existing purchases', 400));
    }
    const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return next(new AppError('Supplier not found', 404));
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) {
    next(err);
  }
};
