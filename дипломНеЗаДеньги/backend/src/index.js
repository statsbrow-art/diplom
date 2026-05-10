const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mockData = require('./data/mockData');

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'bookstore-secret-key-2024';

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Не авторизован' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Не авторизован' });
  }
};

const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Не авторизован' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    const user = mockData.getUserById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Не авторизован' });
  }
};

app.get('/api/books', (req, res) => {
  const { category, search, sort, minPrice, maxPrice, limit = 50, offset = 0 } = req.query;
  let result = [...mockData.books];

  if (category) {
    result = result.filter(b => b.category_slug === category);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.author_name.toLowerCase().includes(q)
    );
  }
  if (minPrice) result = result.filter(b => b.price >= Number(minPrice));
  if (maxPrice) result = result.filter(b => b.price <= Number(maxPrice));

  switch (sort) {
    case 'price-asc': result.sort((a, b) => a.price - b.price); break;
    case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    case 'new': result.sort((a, b) => b.year - a.year); break;
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    default: result.sort((a, b) => b.sales_count - a.sales_count);
  }

  res.json({ books: result.slice(Number(offset), Number(offset) + Number(limit)), total: result.length });
});

app.get('/api/books/bestsellers', (req, res) => {
  const result = [...mockData.books].sort((a, b) => b.sales_count - a.sales_count).slice(0, 8);
  res.json(result);
});

app.get('/api/books/new', (req, res) => {
  const result = [...mockData.books].sort((a, b) => b.year - a.year).slice(0, 8);
  res.json(result);
});

app.get('/api/books/discounted', (req, res) => {
  const result = mockData.books.filter(b => b.discount > 0).sort((a, b) => b.discount - a.discount);
  res.json(result);
});

app.get('/api/books/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const query = q.toLowerCase();
  const result = mockData.books.filter(b => 
    b.title.toLowerCase().includes(query) || 
    b.author_name.toLowerCase().includes(query)
  );
  res.json(result);
});

app.get('/api/books/:id', (req, res) => {
  const book = mockData.books.find(b => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Книга не найдена' });
  res.json(book);
});

app.get('/api/categories', (req, res) => {
  res.json(mockData.categories);
});

app.get('/api/categories/:slug', (req, res) => {
  const category = mockData.categories.find(c => c.slug === req.params.slug);
  if (!category) return res.status(404).json({ error: 'Категория не найдена' });
  res.json(category);
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (mockData.getUserByEmail(email)) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = mockData.createUser({ name, email, password_hash, phone, role: 'customer' });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = mockData.getUserByEmail(email);
    if (!user) return res.status(400).json({ error: 'Неверный email или пароль' });
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Неверный email или пароль' });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = mockData.getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const { password_hash: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/auth/me', auth, async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const user = mockData.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Введите текущий пароль' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Неверный текущий пароль' });
      }
      updateData.password_hash = await bcrypt.hash(newPassword, 10);
    }
    
    const updatedUser = mockData.updateUser(req.userId, updateData);
    const { password_hash: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/addresses', auth, (req, res) => {
  const items = mockData.getAddressesByUser(req.userId);
  res.json(items);
});

app.post('/api/addresses', auth, (req, res) => {
  const { city, street, building, apartment, is_default } = req.body;
  const address = mockData.createAddress({
    user_id: req.userId,
    city,
    street,
    building,
    apartment,
    is_default: is_default || false
  });
  res.status(201).json(address);
});

app.put('/api/addresses/:id', auth, (req, res) => {
  const address = mockData.getAddressById(Number(req.params.id));
  if (!address || address.user_id !== req.userId) {
    return res.status(404).json({ error: 'Адрес не найден' });
  }
  const { city, street, building, apartment, is_default } = req.body;
  const updated = mockData.updateAddress(Number(req.params.id), {
    city, street, building, apartment, is_default
  });
  res.json(updated);
});

app.delete('/api/addresses/:id', auth, (req, res) => {
  const address = mockData.getAddressById(Number(req.params.id));
  if (!address || address.user_id !== req.userId) {
    return res.status(404).json({ error: 'Адрес не найден' });
  }
  mockData.deleteAddress(Number(req.params.id));
  res.json({ message: 'Адрес удалён' });
});

app.get('/api/payment-methods', auth, (req, res) => {
  const items = mockData.getPaymentMethodsByUser(req.userId);
  res.json(items);
});

app.post('/api/payment-methods', auth, (req, res) => {
  const { type, card_number, card_holder, expiry_date, is_default } = req.body;
  const payment = mockData.createPaymentMethod({
    user_id: req.userId,
    type: type || 'card',
    card_number,
    card_holder,
    expiry_date,
    is_default: is_default || false
  });
  res.status(201).json(payment);
});

app.put('/api/payment-methods/:id', auth, (req, res) => {
  const payment = mockData.getPaymentMethodById(Number(req.params.id));
  if (!payment || payment.user_id !== req.userId) {
    return res.status(404).json({ error: 'Способ оплаты не найден' });
  }
  const { type, card_number, card_holder, expiry_date, is_default } = req.body;
  const updated = mockData.updatePaymentMethod(Number(req.params.id), {
    type, card_number, card_holder, expiry_date, is_default
  });
  res.json(updated);
});

app.delete('/api/payment-methods/:id', auth, (req, res) => {
  const payment = mockData.getPaymentMethodById(Number(req.params.id));
  if (!payment || payment.user_id !== req.userId) {
    return res.status(404).json({ error: 'Способ оплаты не найден' });
  }
  mockData.deletePaymentMethod(Number(req.params.id));
  res.json({ message: 'Способ оплаты удалён' });
});

app.get('/api/cart', auth, (req, res) => {
  const items = mockData.getCartByUser(req.userId);
  const result = items.map(item => {
    const book = mockData.books.find(b => b.id === item.book_id);
    return { ...item, book };
  });
  res.json(result);
});

app.post('/api/cart', auth, (req, res) => {
  const { bookId, quantity = 1 } = req.body;
  const item = mockData.addToCart(req.userId, bookId, quantity);
  const book = mockData.books.find(b => b.id === bookId);
  res.status(201).json({ ...item, book });
});

app.patch('/api/cart/:bookId', auth, (req, res) => {
  const { quantity } = req.body;
  if (quantity <= 0) {
    mockData.removeFromCart(req.userId, Number(req.params.bookId));
    return res.json({ message: 'Удалено' });
  }
  const item = mockData.updateCartItem(req.userId, Number(req.params.bookId), quantity);
  res.json(item);
});

app.delete('/api/cart/:bookId', auth, (req, res) => {
  mockData.removeFromCart(req.userId, Number(req.params.bookId));
  res.json({ message: 'Удалено' });
});

app.delete('/api/cart', auth, (req, res) => {
  mockData.clearCart(req.userId);
  res.json({ message: 'Корзина очищена' });
});

app.get('/api/favorites', auth, (req, res) => {
  const items = mockData.getFavoritesByUser(req.userId);
  const result = items.map(item => {
    const book = mockData.books.find(b => b.id === item.book_id);
    return { ...item, book };
  });
  res.json(result);
});

app.post('/api/favorites/:bookId', auth, (req, res) => {
  mockData.addToFavorites(req.userId, Number(req.params.bookId));
  res.status(201).json({ message: 'Добавлено в избранное' });
});

app.delete('/api/favorites/:bookId', auth, (req, res) => {
  mockData.removeFromFavorites(req.userId, Number(req.params.bookId));
  res.json({ message: 'Удалено из избранного' });
});

app.get('/api/favorites/check/:bookId', auth, (req, res) => {
  const isFavorite = mockData.isFavorite(req.userId, Number(req.params.bookId));
  res.json({ isFavorite });
});

app.get('/api/orders', auth, (req, res) => {
  const orders = mockData.getOrdersByUser(req.userId);
  res.json(orders);
});

app.get('/api/orders/:id', auth, (req, res) => {
  const order = mockData.getOrderById(Number(req.params.id));
  if (!order || order.user_id !== req.userId) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }
  res.json(order);
});

app.post('/api/orders', auth, (req, res) => {
  const { items, delivery, paymentMethod } = req.body;
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryPrice = delivery.method === 'pickup' ? 0 : totalPrice >= 50 ? 0 : 5;
  
  const order = mockData.createOrder({
    user_id: req.userId,
    items: items.map(item => ({
      book_id: item.id,
      quantity: item.quantity,
      price: item.price
    })),
    total_price: totalPrice,
    delivery_price: deliveryPrice,
    delivery_method: delivery.method,
    delivery_city: delivery.city,
    delivery_address: delivery.address,
    delivery_phone: delivery.phone,
    payment_method: paymentMethod,
    comment: delivery.comment,
  });
  
  mockData.clearCart(req.userId);
  
  setTimeout(() => {
    mockData.updateOrderStatus(order.id, 'confirmed');
  }, 5000);
  
  setTimeout(() => {
    mockData.updateOrderStatus(order.id, 'processing');
  }, 15000);
  
  res.status(201).json(order);
});

app.patch('/api/orders/:id/status', auth, (req, res) => {
  const { status } = req.body;
  const order = mockData.getOrderById(Number(req.params.id));
  if (!order || order.user_id !== req.userId) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }
  mockData.updateOrderStatus(Number(req.params.id), status);
  res.json({ message: 'Статус обновлён' });
});

app.delete('/api/orders/:id', auth, (req, res) => {
  const order = mockData.getOrderById(Number(req.params.id));
  if (!order || order.user_id !== req.userId) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }
  if (order.status !== 'pending') {
    return res.status(400).json({ error: 'Нельзя отменить заказ в этом статусе' });
  }
  mockData.updateOrderStatus(Number(req.params.id), 'cancelled');
  res.json({ message: 'Заказ отменён' });
});

app.get('/api/stores', (req, res) => {
  res.json(mockData.stores);
});

app.get('/api/stores/:id', (req, res) => {
  const store = mockData.stores.find(s => s.id === Number(req.params.id));
  if (!store) return res.status(404).json({ error: 'Магазин не найден' });
  res.json(store);
});

// === Reviews ===
app.get('/api/books/:id/reviews', (req, res) => {
  const reviews = mockData.getReviewsByBook(Number(req.params.id));
  const enriched = reviews.map(r => {
    const user = mockData.getUserById(r.user_id);
    return { ...r, user_name: user ? user.name : 'Пользователь' };
  });
  res.json(enriched);
});

app.post('/api/books/:id/reviews', auth, (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' });
  }
  const user = mockData.getUserById(req.userId);
  const review = mockData.createReview({
    book_id: Number(req.params.id),
    user_id: req.userId,
    rating: Number(rating),
    comment: comment || '',
  });
  res.status(201).json({ ...review, user_name: user ? user.name : 'Пользователь' });
});

// === Promo Codes (public) ===
app.post('/api/promo/validate', auth, (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) return res.status(400).json({ error: 'Введите промокод' });
  const promo = mockData.getPromoByCode(code);
  if (!promo) return res.status(404).json({ error: 'Промокод не найден' });
  if (!promo.is_active) return res.status(400).json({ error: 'Промокод неактивен' });
  if (promo.current_uses >= promo.max_uses) return res.status(400).json({ error: 'Промокод исчерпан' });
  const now = new Date();
  if (new Date(promo.valid_from) > now || new Date(promo.valid_until) < now) {
    return res.status(400).json({ error: 'Промокод просрочен' });
  }
  if (orderAmount && orderAmount < promo.min_order_amount) {
    return res.status(400).json({ error: `Минимальная сумма заказа: ${promo.min_order_amount} р.` });
  }
  let discount = 0;
  if (promo.discount_percent) {
    discount = orderAmount ? (orderAmount * promo.discount_percent / 100) : promo.discount_percent;
  } else if (promo.discount_amount) {
    discount = promo.discount_amount;
  }
  res.json({ valid: true, discount: Number(discount.toFixed(2)), promo });
});

// === Admin API ===
app.get('/api/admin/stats', adminAuth, (req, res) => {
  res.json(mockData.getStats());
});

app.get('/api/admin/users', adminAuth, (req, res) => {
  const users = mockData.getUsers().map(u => {
    const { password_hash, ...safe } = u;
    return safe;
  });
  res.json(users);
});

app.put('/api/admin/users/:id/role', adminAuth, (req, res) => {
  const { role } = req.body;
  const user = mockData.updateUser(Number(req.params.id), { role });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const { password_hash, ...safe } = user;
  res.json(safe);
});

app.delete('/api/admin/users/:id', adminAuth, (req, res) => {
  mockData.deleteUser(Number(req.params.id));
  res.json({ message: 'Пользователь удалён' });
});

app.get('/api/admin/orders', adminAuth, (req, res) => {
  const orders = mockData.getAllOrders();
  const enriched = orders.map(o => {
    const user = mockData.getUserById(o.user_id);
    return { ...o, user_name: user ? user.name : 'Удалённый пользователь', user_email: user ? user.email : '' };
  });
  res.json(enriched);
});

app.patch('/api/admin/orders/:id/status', adminAuth, (req, res) => {
  const { status } = req.body;
  const order = mockData.updateOrderStatus(Number(req.params.id), status);
  if (!order) return res.status(404).json({ error: 'Заказ не найден' });
  res.json(order);
});

app.get('/api/admin/books', adminAuth, (req, res) => {
  res.json(mockData.books);
});

app.post('/api/admin/books', adminAuth, (req, res) => {
  const book = mockData.createBook(req.body);
  res.status(201).json(book);
});

app.put('/api/admin/books/:id', adminAuth, (req, res) => {
  const book = mockData.updateBook(Number(req.params.id), req.body);
  if (!book) return res.status(404).json({ error: 'Книга не найдена' });
  res.json(book);
});

app.delete('/api/admin/books/:id', adminAuth, (req, res) => {
  mockData.deleteBook(Number(req.params.id));
  res.json({ message: 'Книга удалена' });
});

app.get('/api/admin/promo', adminAuth, (req, res) => {
  res.json(mockData.getPromoCodes());
});

app.post('/api/admin/promo', adminAuth, (req, res) => {
  const promo = mockData.createPromo(req.body);
  res.status(201).json(promo);
});

app.put('/api/admin/promo/:id', adminAuth, (req, res) => {
  const promo = mockData.updatePromo(Number(req.params.id), req.body);
  if (!promo) return res.status(404).json({ error: 'Промокод не найден' });
  res.json(promo);
});

app.delete('/api/admin/promo/:id', adminAuth, (req, res) => {
  mockData.deletePromo(Number(req.params.id));
  res.json({ message: 'Промокод удалён' });
});

app.get('/api/admin/reviews', adminAuth, (req, res) => {
  const reviews = mockData.getAllReviews();
  const enriched = reviews.map(r => {
    const user = mockData.getUserById(r.user_id);
    const book = mockData.books.find(b => b.id === r.book_id);
    return { ...r, user_name: user ? user.name : 'Удалён', book_title: book ? book.title : 'Удалена' };
  });
  res.json(enriched);
});

app.delete('/api/admin/reviews/:id', adminAuth, (req, res) => {
  mockData.deleteReview(Number(req.params.id));
  res.json({ message: 'Отзыв удалён' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'mock', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Using mock data (no database required)');
});
