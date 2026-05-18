const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = require('./config/db');
const initDatabase = require('./config/initDb');

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'bookstore-secret-key-2024';

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: '\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
    if (!rows[0] || rows[0].role !== 'admin') {
      return res.status(403).json({ error: '\u0414\u043e\u0441\u0442\u0443\u043f \u0437\u0430\u043f\u0440\u0435\u0449\u0451\u043d' });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: '\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d' });
  }
};

const BOOK_SELECT = "b.id, b.title, a.name AS author_name, b.price, b.old_price, b.discount, b.image_url, b.year, b.rating, b.stock, b.sales_count, c.id AS category_id, c.name AS category_name, c.slug AS category_slug";
const BOOK_SELECT_SHORT = "b.id, b.title, a.name AS author_name, b.price, b.old_price, b.discount, b.image_url, b.year, b.rating, b.stock, b.sales_count, c.id AS category_id, c.name AS category_name, c.slug AS category_slug";
const BOOK_JOIN = "FROM books b LEFT JOIN authors a ON b.author_id = a.id LEFT JOIN categories c ON b.category_id = c.id";

// === Books ===
app.get('/api/books', async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, limit = 50, offset = 0 } = req.query;
    let query = `SELECT ${BOOK_SELECT} ${BOOK_JOIN} WHERE 1=1`;
    const params = [];
    let paramIdx = 1;
    if (category) { query += ' AND c.slug = $' + paramIdx++; params.push(category); }
    if (search) { query += ' AND (LOWER(b.title) LIKE $' + paramIdx + ' OR LOWER(a.name) LIKE $' + paramIdx + ')'; params.push('%' + search.toLowerCase() + '%'); paramIdx++; }
    if (minPrice) { query += ' AND b.price >= $' + paramIdx++; params.push(Number(minPrice)); }
    if (maxPrice) { query += ' AND b.price <= $' + paramIdx++; params.push(Number(maxPrice)); }
    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    switch (sort) {
      case 'price-asc': query += ' ORDER BY b.price ASC'; break;
      case 'price-desc': query += ' ORDER BY b.price DESC'; break;
      case 'new': query += ' ORDER BY b.year DESC'; break;
      case 'rating': query += ' ORDER BY b.rating DESC'; break;
      default: query += ' ORDER BY b.sales_count DESC';
    }
    query += ' LIMIT $' + paramIdx++ + ' OFFSET $' + paramIdx++;
    params.push(Number(limit), Number(offset));
    const { rows } = await pool.query(query, params);
    res.json({ books: rows, total });
  } catch (error) {
    console.error('GET /api/books error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

app.get('/api/books/bestsellers', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ${BOOK_SELECT_SHORT} ${BOOK_JOIN} ORDER BY b.sales_count DESC LIMIT 8`);
    res.json(rows);
  } catch (error) {
    console.error('GET /api/books/bestsellers error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

app.get('/api/books/new', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ${BOOK_SELECT_SHORT} ${BOOK_JOIN} ORDER BY b.year DESC, b.created_at DESC LIMIT 8`);
    res.json(rows);
  } catch (error) {
    console.error('GET /api/books/new error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

app.get('/api/books/discounted', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ${BOOK_SELECT_SHORT} ${BOOK_JOIN} WHERE b.discount > 0 ORDER BY b.discount DESC`);
    res.json(rows);
  } catch (error) {
    console.error('GET /api/books/discounted error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

app.get('/api/books/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const { rows } = await pool.query(`SELECT ${BOOK_SELECT_SHORT} ${BOOK_JOIN} WHERE (LOWER(b.title) LIKE $1 OR LOWER(a.name) LIKE $1) ORDER BY b.sales_count DESC`, ['%' + q.toLowerCase() + '%']);
    res.json(rows);
  } catch (error) {
    console.error('GET /api/books/search error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ${BOOK_SELECT} ${BOOK_JOIN} WHERE b.id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: '\u041a\u043d\u0438\u0433\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430' });
    res.json(rows[0]);
  } catch (error) {
    console.error('GET /api/books/:id error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

// === Categories ===
app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, slug FROM categories ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, slug FROM categories WHERE slug = $1', [req.params.slug]);
    if (!rows[0]) return res.status(404).json({ error: '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430' });
    res.json(rows[0]);
  } catch (error) {
    console.error('GET /api/categories/:slug error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

// === Auth ===
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0441 \u0442\u0430\u043a\u0438\u043c email \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442' });
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query('INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role, created_at', [name, email, password_hash, phone || null, 'customer']);
    const user = rows[0];
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('POST /api/auth/register error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: '\u041d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 email \u0438\u043b\u0438 \u043f\u0430\u0440\u043e\u043b\u044c' });
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: '\u041d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 email \u0438\u043b\u0438 \u043f\u0430\u0440\u043e\u043b\u044c' });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1', [req.userId]);
    if (!rows[0]) return res.status(404).json({ error: '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    res.json(rows[0]);
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

app.put('/api/auth/me', auth, async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const { rows: userRows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ error: '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    const updates = []; const values = []; let paramIdx = 1;
    if (name) { updates.push('name = $' + paramIdx++); values.push(name); }
    if (phone) { updates.push('phone = $' + paramIdx++); values.push(phone); }
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043f\u0430\u0440\u043e\u043b\u044c' });
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) return res.status(400).json({ error: '\u041d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043f\u0430\u0440\u043e\u043b\u044c' });
      const hash = await bcrypt.hash(newPassword, 10);
      updates.push('password_hash = $' + paramIdx++); values.push(hash);
    }
    if (updates.length === 0) { const { password_hash, ...safe } = user; return res.json(safe); }
    values.push(req.userId);
    const { rows } = await pool.query('UPDATE users SET ' + updates.join(', ') + ' WHERE id = $' + paramIdx + ' RETURNING id, name, email, phone, role, created_at', values);
    res.json(rows[0]);
  } catch (error) {
    console.error('PUT /api/auth/me error:', error);
    res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' });
  }
});

// === Addresses ===
app.get('/api/addresses', auth, async (req, res) => {
  try { const { rows } = await pool.query('SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, id', [req.userId]); res.json(rows); }
  catch (error) { console.error('GET /api/addresses error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.post('/api/addresses', auth, async (req, res) => {
  try {
    const { city, street, building, apartment, is_default } = req.body;
    if (is_default) await pool.query('UPDATE user_addresses SET is_default = false WHERE user_id = $1', [req.userId]);
    const { rows } = await pool.query('INSERT INTO user_addresses (user_id, city, street, building, apartment, is_default) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [req.userId, city, street, building || null, apartment || null, is_default || false]);
    res.status(201).json(rows[0]);
  } catch (error) { console.error('POST /api/addresses error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.put('/api/addresses/:id', auth, async (req, res) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!existing[0]) return res.status(404).json({ error: '\u0410\u0434\u0440\u0435\u0441 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    const { city, street, building, apartment, is_default } = req.body;
    if (is_default) await pool.query('UPDATE user_addresses SET is_default = false WHERE user_id = $1', [req.userId]);
    const { rows } = await pool.query('UPDATE user_addresses SET city = $1, street = $2, building = $3, apartment = $4, is_default = $5 WHERE id = $6 RETURNING *', [city, street, building, apartment, is_default || false, req.params.id]);
    res.json(rows[0]);
  } catch (error) { console.error('PUT /api/addresses/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.delete('/api/addresses/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM user_addresses WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (result.rowCount === 0) return res.status(404).json({ error: '\u0410\u0434\u0440\u0435\u0441 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    res.json({ message: '\u0410\u0434\u0440\u0435\u0441 \u0443\u0434\u0430\u043b\u0451\u043d' });
  } catch (error) { console.error('DELETE /api/addresses/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Payment Methods ===
app.get('/api/payment-methods', auth, async (req, res) => {
  try { const { rows } = await pool.query('SELECT * FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, id', [req.userId]); res.json(rows); }
  catch (error) { console.error('GET /api/payment-methods error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.post('/api/payment-methods', auth, async (req, res) => {
  try {
    const { type, card_number, card_holder, expiry_date, is_default } = req.body;
    if (is_default) await pool.query('UPDATE payment_methods SET is_default = false WHERE user_id = $1', [req.userId]);
    const { rows } = await pool.query('INSERT INTO payment_methods (user_id, type, card_number, card_holder, expiry_date, is_default) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [req.userId, type || 'card', card_number, card_holder, expiry_date, is_default || false]);
    res.status(201).json(rows[0]);
  } catch (error) { console.error('POST /api/payment-methods error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.put('/api/payment-methods/:id', auth, async (req, res) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM payment_methods WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!existing[0]) return res.status(404).json({ error: '\u0421\u043f\u043e\u0441\u043e\u0431 \u043e\u043f\u043b\u0430\u0442\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    const { type, card_number, card_holder, expiry_date, is_default } = req.body;
    if (is_default) await pool.query('UPDATE payment_methods SET is_default = false WHERE user_id = $1', [req.userId]);
    const { rows } = await pool.query('UPDATE payment_methods SET type = $1, card_number = $2, card_holder = $3, expiry_date = $4, is_default = $5 WHERE id = $6 RETURNING *', [type, card_number, card_holder, expiry_date, is_default || false, req.params.id]);
    res.json(rows[0]);
  } catch (error) { console.error('PUT /api/payment-methods/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.delete('/api/payment-methods/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM payment_methods WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (result.rowCount === 0) return res.status(404).json({ error: '\u0421\u043f\u043e\u0441\u043e\u0431 \u043e\u043f\u043b\u0430\u0442\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    res.json({ message: '\u0421\u043f\u043e\u0441\u043e\u0431 \u043e\u043f\u043b\u0430\u0442\u044b \u0443\u0434\u0430\u043b\u0451\u043d' });
  } catch (error) { console.error('DELETE /api/payment-methods/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Cart ===
app.get('/api/cart', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ci.id, ci.user_id, ci.book_id, ci.quantity, b.title, a.name AS author_name, b.price, b.old_price, b.discount, b.image_url, b.stock, b.is_active, b.rating, b.year, b.sales_count, c.id AS category_id, c.name AS category_name, c.slug AS category_slug FROM cart_items ci JOIN books b ON ci.book_id = b.id LEFT JOIN authors a ON b.author_id = a.id LEFT JOIN categories c ON b.category_id = c.id WHERE ci.user_id = $1 ORDER BY ci.created_at`, [req.userId]);
    res.json(rows.map(row => ({ id: row.id, user_id: row.user_id, book_id: row.book_id, quantity: row.quantity, book: { id: row.book_id, title: row.title, author_name: row.author_name, price: row.price, old_price: row.old_price, discount: row.discount, image_url: row.image_url, stock: row.stock, is_active: row.is_active, rating: row.rating, year: row.year, sales_count: row.sales_count, category_id: row.category_id, category_name: row.category_name, category_slug: row.category_slug } })));
  } catch (error) { console.error('GET /api/cart error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.post('/api/cart', auth, async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const { rows: existing } = await pool.query('SELECT * FROM cart_items WHERE user_id = $1 AND book_id = $2', [req.userId, bookId]);
    let item;
    if (existing[0]) { const { rows } = await pool.query('UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND book_id = $3 RETURNING *', [quantity, req.userId, bookId]); item = rows[0]; }
    else { const { rows } = await pool.query('INSERT INTO cart_items (user_id, book_id, quantity) VALUES ($1, $2, $3) RETURNING *', [req.userId, bookId, quantity]); item = rows[0]; }
    const { rows: bookRows } = await pool.query(`SELECT ${BOOK_SELECT_SHORT} ${BOOK_JOIN} WHERE b.id = $1`, [bookId]);
    res.status(201).json({ ...item, book: bookRows[0] });
  } catch (error) { console.error('POST /api/cart error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.patch('/api/cart/:bookId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) { await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2', [req.userId, req.params.bookId]); return res.json({ message: '\u0423\u0434\u0430\u043b\u0435\u043d\u043e' }); }
    const { rows } = await pool.query('UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND book_id = $3 RETURNING *', [quantity, req.userId, req.params.bookId]);
    res.json(rows[0]);
  } catch (error) { console.error('PATCH /api/cart/:bookId error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.delete('/api/cart/:bookId', auth, async (req, res) => {
  try { await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2', [req.userId, req.params.bookId]); res.json({ message: '\u0423\u0434\u0430\u043b\u0435\u043d\u043e' }); }
  catch (error) { console.error('DELETE /api/cart/:bookId error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.delete('/api/cart', auth, async (req, res) => {
  try { await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.userId]); res.json({ message: '\u041a\u043e\u0440\u0437\u0438\u043d\u0430 \u043e\u0447\u0438\u0449\u0435\u043d\u0430' }); }
  catch (error) { console.error('DELETE /api/cart error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Favorites ===
app.get('/api/favorites', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT f.id, f.user_id, f.book_id, f.created_at, b.title, a.name AS author_name, b.price, b.old_price, b.discount, b.image_url, b.stock, b.is_active, b.rating, b.year, b.sales_count, c.id AS category_id, c.name AS category_name, c.slug AS category_slug FROM favorites f JOIN books b ON f.book_id = b.id LEFT JOIN authors a ON b.author_id = a.id LEFT JOIN categories c ON b.category_id = c.id WHERE f.user_id = $1 ORDER BY f.created_at DESC`, [req.userId]);
    res.json(rows.map(row => ({ id: row.id, user_id: row.user_id, book_id: row.book_id, created_at: row.created_at, book: { id: row.book_id, title: row.title, author_name: row.author_name, price: row.price, old_price: row.old_price, discount: row.discount, image_url: row.image_url, stock: row.stock, is_active: row.is_active, rating: row.rating, year: row.year, sales_count: row.sales_count, category_id: row.category_id, category_name: row.category_name, category_slug: row.category_slug } })));
  } catch (error) { console.error('GET /api/favorites error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.post('/api/favorites/:bookId', auth, async (req, res) => {
  try { await pool.query('INSERT INTO favorites (user_id, book_id) VALUES ($1, $2) ON CONFLICT (user_id, book_id) DO NOTHING', [req.userId, req.params.bookId]); res.status(201).json({ message: '\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e \u0432 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435' }); }
  catch (error) { console.error('POST /api/favorites/:bookId error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.delete('/api/favorites/:bookId', auth, async (req, res) => {
  try { await pool.query('DELETE FROM favorites WHERE user_id = $1 AND book_id = $2', [req.userId, req.params.bookId]); res.json({ message: '\u0423\u0434\u0430\u043b\u0435\u043d\u043e \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e' }); }
  catch (error) { console.error('DELETE /api/favorites/:bookId error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.get('/api/favorites/check/:bookId', auth, async (req, res) => {
  try { const { rows } = await pool.query('SELECT id FROM favorites WHERE user_id = $1 AND book_id = $2', [req.userId, req.params.bookId]); res.json({ isFavorite: rows.length > 0 }); }
  catch (error) { console.error('GET /api/favorites/check/:bookId error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Orders ===
app.get('/api/orders', auth, async (req, res) => {
  try {
    const { rows: orders } = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
    for (const order of orders) {
      const { rows: items } = await pool.query(`SELECT oi.*, b.title, a.name AS author_name, b.price AS book_price, b.image_url, b.old_price, b.discount, b.rating,       b.stock, b.year, b.sales_count, c.id AS category_id, c.name AS category_name, c.slug AS category_slug FROM order_items oi JOIN books b ON oi.book_id = b.id LEFT JOIN authors a ON b.author_id = a.id LEFT JOIN categories c ON b.category_id = c.id WHERE oi.order_id = $1`, [order.id]);
            order.items = items.map(item => ({ ...item, book: { id: item.book_id, title: item.title, author_name: item.author_name, price: item.book_price, image_url: item.image_url, old_price: item.old_price, discount: item.discount, rating: item.rating, stock: item.stock, year: item.year, sales_count: item.sales_count, category_id: item.category_id, category_name: item.category_name, category_slug: item.category_slug } }));
    }
    res.json(orders);
  } catch (error) { console.error('GET /api/orders error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.get('/api/orders/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!rows[0]) return res.status(404).json({ error: '\u0417\u0430\u043a\u0430\u0437 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    const order = rows[0];
    const { rows: items } = await pool.query('SELECT oi.*, b.title, a.name AS author_name, b.price AS book_price, b.image_url FROM order_items oi JOIN books b ON oi.book_id = b.id LEFT JOIN authors a ON b.author_id = a.id WHERE oi.order_id = $1', [order.id]);
    order.items = items.map(item => ({ ...item, book: { id: item.book_id, title: item.title, author_name: item.author_name, price: item.book_price, image_url: item.image_url } }));
    res.json(order);
  } catch (error) { console.error('GET /api/orders/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.post('/api/orders', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { items, delivery, paymentMethod } = req.body;
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryPrice = delivery.method === 'pickup' ? 0 : totalPrice >= 50 ? 0 : 5;
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase();
    const { rows: orderRows } = await client.query("INSERT INTO orders (order_number, user_id, total_price, delivery_price, delivery_method, delivery_city, delivery_address, delivery_phone, payment_method, comment, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') RETURNING *", [orderNumber, req.userId, totalPrice, deliveryPrice, delivery.method, delivery.city, delivery.address, delivery.phone, paymentMethod, delivery.comment || null]);
    const order = orderRows[0];
    for (const item of items) { await client.query('INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ($1, $2, $3, $4)', [order.id, item.id, item.quantity, item.price]); }
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.userId]);
    await client.query('COMMIT');
    const { rows: orderItems } = await pool.query('SELECT oi.*, b.title, a.name AS author_name, b.price AS book_price, b.image_url FROM order_items oi JOIN books b ON oi.book_id = b.id LEFT JOIN authors a ON b.author_id = a.id WHERE oi.order_id = $1', [order.id]);
    order.items = orderItems.map(item => ({ ...item, book: { id: item.book_id, title: item.title, author_name: item.author_name, price: item.book_price, image_url: item.image_url } }));
    res.status(201).json(order);
  } catch (error) { await client.query('ROLLBACK'); console.error('POST /api/orders error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
  finally { client.release(); }
});

app.patch('/api/orders/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [status, req.params.id, req.userId]);
    if (!rows[0]) return res.status(404).json({ error: '\u0417\u0430\u043a\u0430\u0437 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    res.json({ message: '\u0421\u0442\u0430\u0442\u0443\u0441 \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d' });
  } catch (error) { console.error('PATCH /api/orders/:id/status error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.delete('/api/orders/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!rows[0]) return res.status(404).json({ error: '\u0417\u0430\u043a\u0430\u0437 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    if (rows[0].status !== 'pending') return res.status(400).json({ error: '\u041d\u0435\u043b\u044c\u0437\u044f \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u0437\u0430\u043a\u0430\u0437 \u0432 \u044d\u0442\u043e\u043c \u0441\u0442\u0430\u0442\u0443\u0441\u0435' });
    await pool.query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [req.params.id]);
    res.json({ message: '\u0417\u0430\u043a\u0430\u0437 \u043e\u0442\u043c\u0435\u043d\u0451\u043d' });
  } catch (error) { console.error('DELETE /api/orders/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Stores ===
app.get('/api/stores', async (req, res) => {
  try { const { rows } = await pool.query('SELECT * FROM stores WHERE is_active = true ORDER BY id'); res.json(rows); }
  catch (error) { console.error('GET /api/stores error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.get('/api/stores/:id', async (req, res) => {
  try { const { rows } = await pool.query('SELECT * FROM stores WHERE id = $1', [req.params.id]); if (!rows[0]) return res.status(404).json({ error: '\u041c\u0430\u0433\u0430\u0437\u0438\u043d \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' }); res.json(rows[0]); }
  catch (error) { console.error('GET /api/stores/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Reviews ===
app.get('/api/books/:id/reviews', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT r.id, r.book_id, r.user_id, r.rating, r.comment, r.is_approved, r.created_at, u.name AS user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.book_id = $1 ORDER BY r.created_at DESC', [req.params.id]);
    res.json(rows.map(r => ({ ...r, user_name: r.user_name || '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c' })));
  } catch (error) { console.error('GET /api/books/:id/reviews error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.post('/api/books/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: '\u0420\u0435\u0439\u0442\u0438\u043d\u0433 \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043e\u0442 1 \u0434\u043e 5' });
    const { rows: userRows } = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);
    const { rows } = await pool.query('INSERT INTO reviews (book_id, user_id, rating, comment, is_approved) VALUES ($1, $2, $3, $4, true) RETURNING *', [req.params.id, req.userId, Number(rating), comment || '']);
    res.status(201).json({ ...rows[0], user_name: userRows[0] ? userRows[0].name : '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c' });
  } catch (error) { console.error('POST /api/books/:id/reviews error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Promo Codes ===
app.post('/api/promo/validate', auth, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ error: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043f\u0440\u043e\u043c\u043e\u043a\u043e\u0434' });
    const { rows } = await pool.query('SELECT * FROM promo_codes WHERE UPPER(code) = UPPER($1)', [code]);
    const promo = rows[0];
    if (!promo) return res.status(404).json({ error: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    if (!promo.is_active) return res.status(400).json({ error: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 \u043d\u0435\u0430\u043a\u0442\u0438\u0432\u0435\u043d' });
    if (promo.max_uses && promo.current_uses >= promo.max_uses) return res.status(400).json({ error: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 \u0438\u0441\u0447\u0435\u0440\u043f\u0430\u043d' });
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) return res.status(400).json({ error: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 \u0435\u0449\u0451 \u043d\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442' });
    if (promo.valid_until && new Date(promo.valid_until) < now) return res.status(400).json({ error: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 \u043f\u0440\u043e\u0441\u0440\u043e\u0447\u0435\u043d' });
    if (orderAmount && promo.min_order_amount && orderAmount < Number(promo.min_order_amount)) return res.status(400).json({ error: '\u041c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u0437\u0430\u043a\u0430\u0437\u0430: ' + promo.min_order_amount + ' \u0440.' });
    let discount = 0;
    if (promo.discount_percent) { discount = orderAmount ? (orderAmount * promo.discount_percent / 100) : promo.discount_percent; }
    else if (promo.discount_amount) { discount = Number(promo.discount_amount); }
    res.json({ valid: true, discount: Number(discount.toFixed(2)), promo });
  } catch (error) { console.error('POST /api/promo/validate error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Admin API ===
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const totalRevenue = await pool.query("SELECT COALESCE(SUM(total_price), 0) AS total FROM orders WHERE status != 'cancelled'");
    const totalOrders = await pool.query('SELECT COUNT(*) AS total FROM orders');
    const totalUsers = await pool.query('SELECT COUNT(*) AS total FROM users');
    const totalBooks = await pool.query('SELECT COUNT(*) AS total FROM books');
    const activeOrders = await pool.query("SELECT COUNT(*) AS total FROM orders WHERE status NOT IN ('delivered', 'cancelled', 'completed')");
    const statusResult = await pool.query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status');
    const ordersByStatus = {}; statusResult.rows.forEach(r => { ordersByStatus[r.status] = parseInt(r.count); });
    const { rows: topBooks } = await pool.query(`SELECT ${BOOK_SELECT_SHORT} ${BOOK_JOIN} ORDER BY b.sales_count DESC LIMIT 5`);
    const { rows: recentOrders } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
    for (const order of recentOrders) {
      const { rows: items } = await pool.query('SELECT oi.*, b.title, a.name AS author_name, b.price AS book_price, b.image_url FROM order_items oi JOIN books b ON oi.book_id = b.id LEFT JOIN authors a ON b.author_id = a.id WHERE oi.order_id = $1', [order.id]);
      order.items = items.map(item => ({ ...item, book: { id: item.book_id, title: item.title, author_name: item.author_name, price: item.book_price, image_url: item.image_url } }));
    }
    res.json({ totalRevenue: Number(totalRevenue.rows[0].total), totalOrders: parseInt(totalOrders.rows[0].total), totalUsers: parseInt(totalUsers.rows[0].total), totalBooks: parseInt(totalBooks.rows[0].total), activeOrders: parseInt(activeOrders.rows[0].total), ordersByStatus, topBooks, recentOrders });
  } catch (error) { console.error('GET /api/admin/stats error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try { const { rows } = await pool.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY id'); res.json(rows); }
  catch (error) { console.error('GET /api/admin/users error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.put('/api/admin/users/:id/role', adminAuth, async (req, res) => {
  try { const { role } = req.body; const { rows } = await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, phone, role, created_at', [role, req.params.id]); if (!rows[0]) return res.status(404).json({ error: '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' }); res.json(rows[0]); }
  catch (error) { console.error('PUT /api/admin/users/:id/role error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
  try { await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]); res.json({ message: '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0443\u0434\u0430\u043b\u0451\u043d' }); }
  catch (error) { console.error('DELETE /api/admin/users/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.get('/api/admin/orders', adminAuth, async (req, res) => {
  try {
    const { rows: orders } = await pool.query('SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC');
    for (const order of orders) {
      const { rows: items } = await pool.query('SELECT oi.*, b.title, a.name AS author_name, b.price AS book_price, b.image_url FROM order_items oi JOIN books b ON oi.book_id = b.id LEFT JOIN authors a ON b.author_id = a.id WHERE oi.order_id = $1', [order.id]);
      order.items = items.map(item => ({ ...item, book: { id: item.book_id, title: item.title, author_name: item.author_name, price: item.book_price, image_url: item.image_url } }));
      order.user_name = order.user_name || '\u0423\u0434\u0430\u043b\u0451\u043d\u043d\u044b\u0439 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c';
      order.user_email = order.user_email || '';
    }
    res.json(orders);
  } catch (error) { console.error('GET /api/admin/orders error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.patch('/api/admin/orders/:id/status', adminAuth, async (req, res) => {
  try { const { status } = req.body; const { rows } = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]); if (!rows[0]) return res.status(404).json({ error: '\u0417\u0430\u043a\u0430\u0437 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' }); res.json(rows[0]); }
  catch (error) { console.error('PATCH /api/admin/orders/:id/status error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.get('/api/admin/books', adminAuth, async (req, res) => {
  try { const { rows } = await pool.query(`SELECT ${BOOK_SELECT} ${BOOK_JOIN} ORDER BY b.id`); res.json(rows); }
  catch (error) { console.error('GET /api/admin/books error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.post('/api/admin/books', adminAuth, async (req, res) => {
  try {
    const { title, author_name, price, old_price, image_url, year, stock, category_id } = req.body;
    let authorId = null;
    if (author_name) {
      const { rows: ea } = await pool.query('SELECT id FROM authors WHERE name = $1', [author_name]);
      if (ea[0]) authorId = ea[0].id;
      else { const { rows: na } = await pool.query('INSERT INTO authors (name) VALUES ($1) RETURNING id', [author_name]); authorId = na[0].id; }
    }
    const { rows } = await pool.query("INSERT INTO books (title, author_id, category_id, price, old_price, image_url, year, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [title, authorId, category_id || null, price, old_price || null, image_url || null, year || null, stock || 0]);
    const { rows: fb } = await pool.query(`SELECT ${BOOK_SELECT} ${BOOK_JOIN} WHERE b.id = $1`, [rows[0].id]);
    res.status(201).json(fb[0]);
  } catch (error) { console.error('POST /api/admin/books error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.put('/api/admin/books/:id', adminAuth, async (req, res) => {
  try {
    const { title, author_name, price, old_price, image_url, year, stock, category_id } = req.body;
    let authorId = null;
    if (author_name) {
      const { rows: ea } = await pool.query('SELECT id FROM authors WHERE name = $1', [author_name]);
      if (ea[0]) authorId = ea[0].id;
      else { const { rows: na } = await pool.query('INSERT INTO authors (name) VALUES ($1) RETURNING id', [author_name]); authorId = na[0].id; }
    }
    const updates = []; const values = []; let idx = 1;
    if (title !== undefined) { updates.push('title = $' + idx++); values.push(title); }
    if (authorId !== null) { updates.push('author_id = $' + idx++); values.push(authorId); }
    if (category_id !== undefined) { updates.push('category_id = $' + idx++); values.push(category_id); }
    if (price !== undefined) { updates.push('price = $' + idx++); values.push(price); }
    if (old_price !== undefined) { updates.push('old_price = $' + idx++); values.push(old_price || null); }
    if (image_url !== undefined) { updates.push('image_url = $' + idx++); values.push(image_url); }
    if (year !== undefined) { updates.push('year = $' + idx++); values.push(year); }
    if (stock !== undefined) { updates.push('stock = $' + idx++); values.push(stock); }
    if (updates.length === 0) return res.status(400).json({ error: '\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445 \u0434\u043b\u044f \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f' });
    values.push(req.params.id);
    await pool.query('UPDATE books SET ' + updates.join(', ') + ' WHERE id = $' + idx, values);
    const { rows } = await pool.query(`SELECT ${BOOK_SELECT} ${BOOK_JOIN} WHERE b.id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: '\u041a\u043d\u0438\u0433\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430' });
    res.json(rows[0]);
  } catch (error) { console.error('PUT /api/admin/books/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.delete('/api/admin/books/:id', adminAuth, async (req, res) => {
  try { await pool.query('DELETE FROM books WHERE id = $1', [req.params.id]); res.json({ message: '\u041a\u043d\u0438\u0433\u0430 \u0443\u0434\u0430\u043b\u0435\u043d\u0430' }); }
  catch (error) { console.error('DELETE /api/admin/books/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Admin Promo ===
app.get('/api/admin/promo', adminAuth, async (req, res) => {
  try { const { rows } = await pool.query('SELECT * FROM promo_codes ORDER BY id'); res.json(rows); }
  catch (error) { console.error('GET /api/admin/promo error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.post('/api/admin/promo', adminAuth, async (req, res) => {
  try {
    const { code, discount_percent, discount_amount, min_order_amount, max_uses, valid_from, valid_until, is_active } = req.body;
    const { rows } = await pool.query('INSERT INTO promo_codes (code, discount_percent, discount_amount, min_order_amount, max_uses, valid_from, valid_until, is_active) VALUES (UPPER($1), $2, $3, $4, $5, $6, $7, $8) RETURNING *', [code, discount_percent || null, discount_amount || null, min_order_amount || null, max_uses || null, valid_from || null, valid_until || null, is_active !== false]);
    res.status(201).json(rows[0]);
  } catch (error) { console.error('POST /api/admin/promo error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.put('/api/admin/promo/:id', adminAuth, async (req, res) => {
  try {
    const { code, discount_percent, discount_amount, min_order_amount, max_uses, valid_from, valid_until, is_active } = req.body;
    const { rows } = await pool.query('UPDATE promo_codes SET code = UPPER($1), discount_percent = $2, discount_amount = $3, min_order_amount = $4, max_uses = $5, valid_from = $6, valid_until = $7, is_active = $8 WHERE id = $9 RETURNING *', [code, discount_percent || null, discount_amount || null, min_order_amount || null, max_uses || null, valid_from || null, valid_until || null, is_active !== false, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d' });
    res.json(rows[0]);
  } catch (error) { console.error('PUT /api/admin/promo/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.delete('/api/admin/promo/:id', adminAuth, async (req, res) => {
  try { await pool.query('DELETE FROM promo_codes WHERE id = $1', [req.params.id]); res.json({ message: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 \u0443\u0434\u0430\u043b\u0451\u043d' }); }
  catch (error) { console.error('DELETE /api/admin/promo/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Admin Reviews ===
app.get('/api/admin/reviews', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT r.id, r.book_id, r.user_id, r.rating, r.comment, r.is_approved, r.created_at, u.name AS user_name, b.title AS book_title FROM reviews r LEFT JOIN users u ON r.user_id = u.id LEFT JOIN books b ON r.book_id = b.id ORDER BY r.created_at DESC');
    res.json(rows.map(r => ({ ...r, user_name: r.user_name || '\u0423\u0434\u0430\u043b\u0451\u043d', book_title: r.book_title || '\u0423\u0434\u0430\u043b\u0435\u043d\u0430' })));
  } catch (error) { console.error('GET /api/admin/reviews error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

app.delete('/api/admin/reviews/:id', adminAuth, async (req, res) => {
  try { await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]); res.json({ message: '\u041e\u0442\u0437\u044b\u0432 \u0443\u0434\u0430\u043b\u0451\u043d' }); }
  catch (error) { console.error('DELETE /api/admin/reviews/:id error:', error); res.status(500).json({ error: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430' }); }
});

// === Health ===
app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', mode: 'postgresql', timestamp: new Date().toISOString() }); }
  catch (error) { res.json({ status: 'error', mode: 'postgresql', error: error.message, timestamp: new Date().toISOString() }); }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log('Server running on http://localhost:' + PORT);
  console.log('Using PostgreSQL database');
  await initDatabase();
});
