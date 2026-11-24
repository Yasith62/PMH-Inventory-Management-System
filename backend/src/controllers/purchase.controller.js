import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const getPurchases = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, s.name AS supplier_name
       FROM purchases p
       JOIN suppliers s ON s.id = p.supplier_id
       ORDER BY p.date DESC, p.id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getPurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [purchases] = await pool.query(
      `SELECT p.*, s.name AS supplier_name, s.contact AS supplier_contact, s.address AS supplier_address
       FROM purchases p
       JOIN suppliers s ON s.id = p.supplier_id
       WHERE p.id = ?`,
      [id]
    );
    if (!purchases[0]) return next(new AppError('Purchase not found', 404));

    const [items] = await pool.query(
      `SELECT pi.*, pr.name AS product_name, pr.brand
       FROM purchase_items pi
       JOIN products pr ON pr.id = pi.product_id
       WHERE pi.purchase_id = ?`,
      [id]
    );

    res.json({ success: true, data: { ...purchases[0], items } });
  } catch (err) {
    next(err);
  }
};

export const createPurchase = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { supplier_id, date, items } = req.body;
    const total_amount = items.reduce((sum, i) => sum + i.quantity * i.cost_price, 0);

    await connection.beginTransaction();

    const [purchaseResult] = await connection.query(
      'INSERT INTO purchases (supplier_id, date, total_amount) VALUES (?, ?, ?)',
      [supplier_id, date, total_amount]
    );
    const purchaseId = purchaseResult.insertId;

    for (const item of items) {
      const [products] = await connection.query('SELECT id FROM products WHERE id = ?', [
        item.product_id,
      ]);
      if (!products[0]) {
        throw new AppError(`Product ${item.product_id} not found`, 404);
      }

      await connection.query(
        'INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price) VALUES (?, ?, ?, ?)',
        [purchaseId, item.product_id, item.quantity, item.cost_price]
      );

      await connection.query(
        'UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();

    const [rows] = await pool.query(
      `SELECT p.*, s.name AS supplier_name FROM purchases p
       JOIN suppliers s ON s.id = p.supplier_id WHERE p.id = ?`,
      [purchaseId]
    );
    const [purchaseItems] = await pool.query(
      `SELECT pi.*, pr.name AS product_name FROM purchase_items pi
       JOIN products pr ON pr.id = pi.product_id WHERE pi.purchase_id = ?`,
      [purchaseId]
    );

    res.status(201).json({ success: true, data: { ...rows[0], items: purchaseItems } });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};
