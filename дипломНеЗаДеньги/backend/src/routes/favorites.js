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

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.book_id, f.created_at,
        b.title, b.price, b.old_price, b.discount, b.image_url, b.rating,
        a.name AS author_name,
        c.name AS category_name
       FROM favorites f
       JOIN books b ON f.book_id = b.id
       LEFT JOIN authors a ON b.author_id = a.id
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;

    const result = await pool.query(
      `INSERT INTO favorites (user_id, book_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, book_id) DO NOTHING
       RETURNING *`,
      [req.userId, bookId]
    );

    res.status(201).json({ message: 'Добавлено в избранное' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND book_id = $2',
      [req.userId, bookId]
    );
    res.json({ message: 'Удалено из избранного' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/check/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const result = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND book_id = $2',
      [req.userId, bookId]
    );
    res.json({ isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

