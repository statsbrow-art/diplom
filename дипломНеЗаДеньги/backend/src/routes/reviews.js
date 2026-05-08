const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Не авторизован' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Не авторизован' });
  }
};

router.get('/book/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.book_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC`,
      [bookId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;

    const existing = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND book_id = $2',
      [req.userId, bookId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Вы уже оставили отзыв на эту книгу' });
    }

    const result = await pool.query(
      'INSERT INTO reviews (user_id, book_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, bookId, rating, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    res.json({ message: 'Отзыв удалён' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

