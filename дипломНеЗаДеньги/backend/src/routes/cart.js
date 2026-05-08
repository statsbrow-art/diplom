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
      `SELECT ci.id, ci.quantity, ci.book_id,
        b.title, b.price, b.old_price, b.discount, b.image_url, b.stock,
        a.name AS author_name
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       LEFT JOIN authors a ON b.author_id = a.id
       WHERE ci.user_id = $1`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, book_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, book_id) 
       DO UPDATE SET quantity = cart_items.quantity + $3
       RETURNING *`,
      [req.userId, bookId, quantity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await pool.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2',
        [req.userId, bookId]
      );
      return res.json({ message: 'Удалено из корзины' });
    }

    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND book_id = $3 RETURNING *',
      [quantity, req.userId, bookId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;
    await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2',
      [req.userId, bookId]
    );
    res.json({ message: 'Удалено из корзины' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.userId]);
    res.json({ message: 'Корзина очищена' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

