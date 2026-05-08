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

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, 
        json_agg(json_build_object(
          'book_id', oi.book_id,
          'title', b.title,
          'author', a.name,
          'image_url', b.image_url,
          'quantity', oi.quantity,
          'price', oi.price
        )) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN books b ON oi.book_id = b.id
       LEFT JOIN authors a ON b.author_id = a.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { items, delivery, paymentMethod } = req.body;
    
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryPrice = delivery.method === 'pickup' ? 0 : totalPrice >= 50 ? 0 : 5;
    const orderNumber = generateOrderNumber();

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, user_id, total_price, delivery_price, delivery_method, delivery_city, delivery_address, delivery_phone, payment_method, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        orderNumber,
        req.userId,
        totalPrice,
        deliveryPrice,
        delivery.method,
        delivery.city,
        delivery.address,
        delivery.phone,
        paymentMethod,
        delivery.comment
      ]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.bookId, item.quantity, item.price]
      );
    }

    await client.query(
      'INSERT INTO payments (order_id, amount, method) VALUES ($1, $2, $3)',
      [order.id, totalPrice + deliveryPrice, paymentMethod]
    );

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.userId]);

    await client.query('COMMIT');

    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM view_order_details WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

