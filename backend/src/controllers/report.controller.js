import pool from '../config/db.js';

export const getDailySales = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let sql = `
      SELECT date, COUNT(*) AS transaction_count, SUM(total_amount) AS revenue
      FROM sales WHERE 1=1`;
    const params = [];

    if (from) {
      sql += ' AND date >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND date <= ?';
      params.push(to);
    }
    sql += ' GROUP BY date ORDER BY date DESC LIMIT 90';

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getMonthlyRevenue = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await pool.query(
      `SELECT MONTH(date) AS month,
              MONTHNAME(date) AS month_name,
              COUNT(*) AS transaction_count,
              COALESCE(SUM(total_amount), 0) AS revenue
       FROM sales
       WHERE YEAR(date) = ?
       GROUP BY MONTH(date), MONTHNAME(date)
       ORDER BY month ASC`,
      [year]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getProfitAnalysis = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let dateFilter = '';
    const params = [];

    if (from && to) {
      dateFilter = ' AND s.date BETWEEN ? AND ?';
      params.push(from, to);
    } else if (from) {
      dateFilter = ' AND s.date >= ?';
      params.push(from);
    } else if (to) {
      dateFilter = ' AND s.date <= ?';
      params.push(to);
    }

    const [rows] = await pool.query(
      `SELECT
         s.date,
         si.product_id,
         pr.name AS product_name,
         SUM(si.quantity) AS qty_sold,
         SUM(si.quantity * si.selling_price) AS revenue,
         SUM(si.quantity * COALESCE(avg_cost.avg_cost, 0)) AS estimated_cost,
         SUM(si.quantity * si.selling_price) - SUM(si.quantity * COALESCE(avg_cost.avg_cost, 0)) AS profit
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       JOIN products pr ON pr.id = si.product_id
       LEFT JOIN (
         SELECT product_id, AVG(cost_price) AS avg_cost
         FROM purchase_items
         GROUP BY product_id
       ) avg_cost ON avg_cost.product_id = si.product_id
       WHERE 1=1 ${dateFilter}
       GROUP BY s.date, si.product_id, pr.name
       ORDER BY s.date DESC, revenue DESC`,
      params
    );

    const [[totals]] = await pool.query(
      `SELECT
         COALESCE(SUM(si.quantity * si.selling_price), 0) AS total_revenue,
         COALESCE(SUM(si.quantity * COALESCE(avg_cost.avg_cost, 0)), 0) AS total_cost,
         COALESCE(SUM(si.quantity * si.selling_price), 0) - COALESCE(SUM(si.quantity * COALESCE(avg_cost.avg_cost, 0)), 0) AS total_profit
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       LEFT JOIN (
         SELECT product_id, AVG(cost_price) AS avg_cost
         FROM purchase_items
         GROUP BY product_id
       ) avg_cost ON avg_cost.product_id = si.product_id
       WHERE 1=1 ${dateFilter}`,
      params
    );

    res.json({ success: true, data: { items: rows, summary: totals } });
  } catch (err) {
    next(err);
  }
};
