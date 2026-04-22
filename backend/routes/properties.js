const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// GET all properties (with filters)
router.get('/', authMiddleware, async (req, res) => {
  const { type, status, minPrice, maxPrice } = req.query;
  let query = 'SELECT p.*, u.name as agent_name FROM properties p LEFT JOIN agents a ON p.agent_id=a.id LEFT JOIN users u ON a.user_id=u.id WHERE 1=1';
  const params = [];
  let count = 1;

  if (type) { query += ` AND p.type=$${count++}`; params.push(type); }
  if (status) { query += ` AND p.status=$${count++}`; params.push(status); }
  if (minPrice) { query += ` AND p.price>=$${count++}`; params.push(minPrice); }
  if (maxPrice) { query += ` AND p.price<=$${count++}`; params.push(maxPrice); }
  query += ' ORDER BY p.created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single property
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create property
router.post('/', authMiddleware, async (req, res) => {
  const { title, type, price, size_sqft, location, latitude, longitude, amenities, images, agent_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO properties (title, type, price, size_sqft, location, latitude, longitude, amenities, images, agent_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [title, type, price, size_sqft, location, latitude, longitude,
       JSON.stringify(amenities), JSON.stringify(images), agent_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update property
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, type, price, size_sqft, location, status, amenities, images } = req.body;
  try {
    const result = await pool.query(
      `UPDATE properties SET title=$1, type=$2, price=$3, size_sqft=$4, location=$5,
       status=$6, amenities=$7, images=$8 WHERE id=$9 RETURNING *`,
      [title, type, price, size_sqft, location, status,
       JSON.stringify(amenities), JSON.stringify(images), req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE property
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM properties WHERE id=$1', [req.params.id]);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
