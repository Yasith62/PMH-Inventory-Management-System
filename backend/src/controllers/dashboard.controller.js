import pool from '../config/db.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [[productCount]] = await pool.query('SELECT COUNT(*) AS total FROM products');
    const [[todaySales]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total, COUNT(*) AS count
       FROM sales WHERE date = CURDATE()`
    );
    const [lowStock] = await pool.query(
      'SELECT * FROM products WHERE stock_qty <= reorder_level ORDER BY stock_qty ASC LIMIT 10'
    );
    const [[monthRevenue]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total
       FROM sales
       WHERE YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())`
    );

    res.json({
      success: true,
      data: {
        total_products: productCount.total,
        today_sales_amount: Number(todaySales.total),
        today_sales_count: todaySales.count,
        month_revenue: Number(monthRevenue.total),
        low_stock: lowStock,
        low_stock_count: lowStock.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
