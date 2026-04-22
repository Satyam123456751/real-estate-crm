const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// GET all clients
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create client
router.post('/', authMiddleware, async (req, res) => {
  const { lead_id, name, email, phone, client_type, preferences } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clients (lead_id, name, email, phone, client_type, preferences) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [lead_id, name, email, phone, client_type, preferences]
    );
    // Update lead status to 'qualified'
    if (lead_id) {
      await pool.query("UPDATE leads SET status='qualified' WHERE id=$1", [lead_id]);
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET client interactions
router.get('/:id/interactions', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT i.*, u.name as agent_name FROM interactions i LEFT JOIN agents a ON i.agent_id=a.id LEFT JOIN users u ON a.user_id=u.id WHERE i.client_id=$1 ORDER BY i.interacted_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST log interaction
router.post('/:id/interactions', authMiddleware, async (req, res) => {
  const { agent_id, type, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO interactions (client_id, agent_id, type, notes) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id, agent_id, type, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
