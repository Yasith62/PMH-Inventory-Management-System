import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

const resolveSellingPrice = (product, override) => {
  if (override != null) return Number(override);
  if (product.discount_price != null) return Number(product.discount_price);
  return Number(product.selling_price);
};

export const getSales = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.name AS staff_name
       FROM sales s
       LEFT JOIN users u ON u.id = s.user_id
       ORDER BY s.date DESC, s.id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [sales] = await pool.query(
      `SELECT s.*, u.name AS staff_name, u.email AS staff_email
       FROM sales s
       LEFT JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [id]
    );
    if (!sales[0]) return next(new AppError('Sale not found', 404));

    const [items] = await pool.query(
      `SELECT si.*, pr.name AS product_name, pr.brand, pr.vehicle_type,
              pr.selling_price AS product_list_price, pr.discount_price AS product_discount_price
       FROM sale_items si
       JOIN products pr ON pr.id = si.product_id
       WHERE si.sale_id = ?`,
      [id]
    );

    res.json({ success: true, data: { ...sales[0], items } });
  } catch (err) {
    next(err);
  }
};

export const createSale = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { date, items } = req.body;
    const userId = req.user.id;

    await connection.beginTransaction();

    let total_amount = 0;
    const lineItems = [];

    for (const item of items) {
      const [products] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [
        item.product_id,
      ]);
      const product = products[0];
      if (!product) throw new AppError(`Product ${item.product_id} not found`, 404);

      if (product.stock_qty < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name}". Available: ${product.stock_qty}, requested: ${item.quantity}`,
          400
        );
      }

      const selling_price = resolveSellingPrice(product, item.selling_price);
      total_amount += selling_price * item.quantity;
      lineItems.push({ ...item, selling_price, product });
    }

    const [saleResult] = await connection.query(
      'INSERT INTO sales (user_id, date, total_amount) VALUES (?, ?, ?)',
      [userId, date, total_amount]
    );
    const saleId = saleResult.insertId;

    for (const item of lineItems) {
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, selling_price) VALUES (?, ?, ?, ?)',
        [saleId, item.product_id, item.quantity, item.selling_price]
      );

      const [updateResult] = await connection.query(
        'UPDATE products SET stock_qty = stock_qty - ? WHERE id = ? AND stock_qty >= ?',
        [item.quantity, item.product_id, item.quantity]
      );

      if (!updateResult.affectedRows) {
        throw new AppError(`Stock update failed for "${item.product.name}"`, 400);
      }
    }

    await connection.commit();

    const [rows] = await pool.query('SELECT * FROM sales WHERE id = ?', [saleId]);
    const [saleItems] = await pool.query(
      `SELECT si.*, pr.name AS product_name, pr.brand,
              pr.selling_price AS product_list_price, pr.discount_price AS product_discount_price
       FROM sale_items si
       JOIN products pr ON pr.id = si.product_id WHERE si.sale_id = ?`,
      [saleId]
    );

    res.status(201).json({ success: true, data: { ...rows[0], items: saleItems } });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};
