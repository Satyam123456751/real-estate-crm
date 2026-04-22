const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// GET all leads
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, u.name as agent_name 
      FROM leads l
      LEFT JOIN agents a ON l.assigned_agent_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY l.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single lead
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create lead
router.post('/', authMiddleware, async (req, res) => {
  const { name, phone, email, source, budget, preferences, assigned_agent_id, follow_up_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO leads (name, phone, email, source, budget, preferences, assigned_agent_id, follow_up_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, phone, email, source, budget, preferences, assigned_agent_id, follow_up_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update lead
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, phone, email, source, status, budget, preferences, assigned_agent_id, follow_up_date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE leads SET name=$1, phone=$2, email=$3, source=$4, status=$5,
       budget=$6, preferences=$7, assigned_agent_id=$8, follow_up_date=$9
       WHERE id=$10 RETURNING *`,
      [name, phone, email, source, status, budget, preferences, assigned_agent_id, follow_up_date, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE lead
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id=$1', [req.params.id]);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET lead stats
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT status, COUNT(*) as count FROM leads GROUP BY status
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
