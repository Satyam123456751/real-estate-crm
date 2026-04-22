const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// GET all deals
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, c.name as client_name, p.title as property_title,
             u.name as agent_name
      FROM deals d
      LEFT JOIN clients c ON d.client_id = c.id
      LEFT JOIN properties p ON d.property_id = p.id
      LEFT JOIN agents a ON d.agent_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create deal
router.post('/', authMiddleware, async (req, res) => {
  const { client_id, property_id, agent_id, deal_value } = req.body;
  try {
    // Auto-calculate commission (2.5% default)
    const agentResult = await pool.query('SELECT commission_rate FROM agents WHERE id=$1', [agent_id]);
    const rate = agentResult.rows[0]?.commission_rate || 2.5;
    const commission = (deal_value * rate) / 100;

    const result = await pool.query(
      `INSERT INTO deals (client_id, property_id, agent_id, deal_value, commission_amount)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [client_id, property_id, agent_id, deal_value, commission]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update deal stage
router.put('/:id/stage', authMiddleware, async (req, res) => {
  const { stage } = req.body;
  try {
    const closed_at = stage === 'closed' ? new Date() : null;
    const result = await pool.query(
      'UPDATE deals SET stage=$1, closed_at=$2 WHERE id=$3 RETURNING *',
      [stage, closed_at, req.params.id]
    );
    // If closed, mark property as sold
    if (stage === 'closed') {
      await pool.query('UPDATE properties SET status=$1 WHERE id=$2',
        ['sold', result.rows[0].property_id]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE deal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM deals WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET deal stats (for dashboard)
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_deals,
        SUM(CASE WHEN stage='closed' THEN deal_value ELSE 0 END) as total_revenue,
        SUM(CASE WHEN stage='closed' THEN commission_amount ELSE 0 END) as total_commission,
        COUNT(CASE WHEN stage='closed' THEN 1 END) as closed_deals
      FROM deals
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
