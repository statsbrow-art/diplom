const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM view_books_full WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category_slug = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (LOWER(title) LIKE $${paramIndex} OR LOWER(author_name) LIKE $${paramIndex})`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (minPrice) {
      query += ` AND price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    switch (sort) {
      case 'price-asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY price DESC';
        break;
      case 'new':
        query += ' ORDER BY created_at DESC';
        break;
      case 'rating':
        query += ' ORDER BY rating DESC';
        break;
      default:
        query += ' ORDER BY sales_count DESC';
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const countQuery = 'SELECT COUNT(*) FROM view_books_full';
    const countResult = await pool.query(countQuery);
    
    res.json({
      books: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/bestsellers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM view_bestsellers');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bestsellers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/new', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM view_new_arrivals');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/discounted', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM view_discounted_books');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching discounted books:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const result = await pool.query(
      `SELECT * FROM view_books_full 
       WHERE LOWER(title) LIKE $1 OR LOWER(author_name) LIKE $1
       ORDER BY 
         CASE 
           WHEN LOWER(title) LIKE $2 THEN 1
           WHEN LOWER(author_name) LIKE $2 THEN 2
           ELSE 3
         END,
         sales_count DESC
       LIMIT 20`,
      [`%${q.toLowerCase()}%`, `${q.toLowerCase()}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM view_books_full WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

