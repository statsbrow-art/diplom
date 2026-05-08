const categories = [
  { id: 1, name: 'Художественная литература', slug: 'fiction', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300' },
  { id: 2, name: 'Нехудожественная литература', slug: 'non-fiction', image_url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300' },
  { id: 3, name: 'Детские книги', slug: 'children', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300' },
  { id: 4, name: 'Бизнес-литература', slug: 'business', image_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300' },
  { id: 5, name: 'Комиксы и манга', slug: 'comics', image_url: 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=300' },
  { id: 6, name: 'Учебная литература', slug: 'education', image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300' },
];

const books = [
  { id: 1, title: 'Атомные привычки', author_name: 'Джеймс Клир', price: 17.85, old_price: 21.50, discount: 17, image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', category_id: 2, category_name: 'Нехудожественная литература', category_slug: 'non-fiction', year: 2024, rating: 4.8, stock: 50, is_active: true, sales_count: 150 },
  { id: 2, title: 'Кафе на краю земли', author_name: 'Джон Стрелеки', price: 10.50, old_price: 13.12, discount: 20, image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop', category_id: 1, category_name: 'Художественная литература', category_slug: 'fiction', year: 2018, rating: 4.6, stock: 35, is_active: true, sales_count: 120 },
  { id: 3, title: 'Мастер и Маргарита', author_name: 'Михаил Булгаков', price: 15.00, old_price: null, discount: 0, image_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop', category_id: 1, category_name: 'Художественная литература', category_slug: 'fiction', year: 2023, rating: 4.9, stock: 100, is_active: true, sales_count: 200 },
  { id: 4, title: '1984', author_name: 'Джордж Оруэлл', price: 12.30, old_price: 14.50, discount: 15, image_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop', category_id: 1, category_name: 'Художественная литература', category_slug: 'fiction', year: 2024, rating: 4.7, stock: 80, is_active: true, sales_count: 180 },
  { id: 5, title: 'Гарри Поттер и философский камень', author_name: 'Дж. К. Роулинг', price: 22.00, old_price: 27.50, discount: 20, image_url: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop', category_id: 3, category_name: 'Детские книги', category_slug: 'children', year: 2024, rating: 4.9, stock: 60, is_active: true, sales_count: 250 },
  { id: 6, title: 'Думай медленно... решай быстро', author_name: 'Даниэль Канеман', price: 19.90, old_price: null, discount: 0, image_url: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=300&h=400&fit=crop', category_id: 2, category_name: 'Нехудожественная литература', category_slug: 'non-fiction', year: 2023, rating: 4.5, stock: 40, is_active: true, sales_count: 90 },
  { id: 7, title: 'Преступление и наказание', author_name: 'Фёдор Достоевский', price: 11.50, old_price: null, discount: 0, image_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&h=400&fit=crop', category_id: 1, category_name: 'Художественная литература', category_slug: 'fiction', year: 2023, rating: 4.8, stock: 90, is_active: true, sales_count: 130 },
  { id: 8, title: 'Война и мир', author_name: 'Лев Толстой', price: 25.00, old_price: 30.00, discount: 17, image_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop', category_id: 1, category_name: 'Художественная литература', category_slug: 'fiction', year: 2024, rating: 4.9, stock: 45, is_active: true, sales_count: 110 },
  { id: 9, title: 'Маленький принц', author_name: 'Антуан де Сент-Экзюпери', price: 8.50, old_price: null, discount: 0, image_url: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=300&h=400&fit=crop', category_id: 3, category_name: 'Детские книги', category_slug: 'children', year: 2023, rating: 4.9, stock: 120, is_active: true, sales_count: 300 },
  { id: 10, title: 'Sapiens. Краткая история человечества', author_name: 'Юваль Ной Харари', price: 23.00, old_price: 28.00, discount: 18, image_url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop', category_id: 2, category_name: 'Нехудожественная литература', category_slug: 'non-fiction', year: 2024, rating: 4.7, stock: 55, is_active: true, sales_count: 140 },
  { id: 11, title: 'Над пропастью во ржи', author_name: 'Джером Сэлинджер', price: 9.80, old_price: null, discount: 0, image_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop', category_id: 1, category_name: 'Художественная литература', category_slug: 'fiction', year: 2023, rating: 4.4, stock: 70, is_active: true, sales_count: 85 },
  { id: 12, title: 'Хоббит', author_name: 'Дж. Р. Р. Толкин', price: 18.50, old_price: 22.00, discount: 16, image_url: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?w=300&h=400&fit=crop', category_id: 1, category_name: 'Художественная литература', category_slug: 'fiction', year: 2024, rating: 4.8, stock: 65, is_active: true, sales_count: 160 },
  { id: 13, title: 'Оно', author_name: 'Стивен Кинг', price: 28.00, old_price: 32.00, discount: 13, image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=400&fit=crop', category_id: 1, category_name: 'Художественная литература', category_slug: 'fiction', year: 2023, rating: 4.6, stock: 30, is_active: true, sales_count: 95 },
  { id: 14, title: 'Норвежский лес', author_name: 'Харуки Мураками', price: 14.50, old_price: null, discount: 0, image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop', category_id: 1, category_name: 'Художественная литература', category_slug: 'fiction', year: 2024, rating: 4.5, stock: 40, is_active: true, sales_count: 75 },
  { id: 15, title: 'Три товарища', author_name: 'Эрих Мария Ремарк', price: 13.20, old_price: 15.50, discount: 15, image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop', category_id: 1, category_name: 'Художественная литература', category_slug: 'fiction', year: 2023, rating: 4.8, stock: 55, is_active: true, sales_count: 125 },
];

const stores = [
  { id: 1, name: 'BookStore ТЦ "Галерея"', city: 'Минск', address: 'пр-т Победителей, 9', phone: '+375 (29) 123-45-01', working_hours: '10:00 - 22:00', latitude: 53.9086, longitude: 27.5499 },
  { id: 2, name: 'BookStore ТЦ "Дана Молл"', city: 'Минск', address: 'пр-т Победителей, 65', phone: '+375 (29) 123-45-02', working_hours: '10:00 - 22:00', latitude: 53.9344, longitude: 27.4879 },
  { id: 3, name: 'BookStore ТЦ "Замок"', city: 'Минск', address: 'пр-т Победителей, 65, корп. 1', phone: '+375 (29) 123-45-03', working_hours: '10:00 - 21:00', latitude: 53.9351, longitude: 27.4889 },
  { id: 4, name: 'BookStore ТЦ "Столица"', city: 'Минск', address: 'пр-т Независимости, 3-2', phone: '+375 (29) 123-45-04', working_hours: '10:00 - 22:00', latitude: 53.8964, longitude: 27.5489 },
  { id: 5, name: 'BookStore ТРЦ "Galleria Minsk"', city: 'Минск', address: 'пр-т Победителей, 9', phone: '+375 (29) 123-45-05', working_hours: '10:00 - 22:00', latitude: 53.9075, longitude: 27.5519 },
  { id: 6, name: 'BookStore ТЦ "Арена Сити"', city: 'Минск', address: 'пр-т Победителей, 84', phone: '+375 (29) 123-45-06', working_hours: '10:00 - 22:00', latitude: 53.9315, longitude: 27.4769 },
  { id: 7, name: 'BookStore ТЦ "Европа"', city: 'Минск', address: 'ул. Сурганова, 57Б', phone: '+375 (29) 123-45-07', working_hours: '10:00 - 21:00', latitude: 53.9195, longitude: 27.5879 },
  { id: 8, name: 'BookStore ТЦ "Корона"', city: 'Минск', address: 'ул. Кальварийская, 24', phone: '+375 (29) 123-45-08', working_hours: '09:00 - 23:00', latitude: 53.8938, longitude: 27.5266 },
];

let users = [];
let orders = [];
let orderItems = [];
let cartItems = [];
let favorites = [];
let reviews = [];
let addresses = [];
let paymentMethods = [];

let userIdCounter = 1;
let orderIdCounter = 1;
let addressIdCounter = 1;
let paymentIdCounter = 1;

module.exports = {
  categories,
  books,
  stores,
  
  getUsers: () => users,
  getUserById: (id) => users.find(u => u.id === id),
  getUserByEmail: (email) => users.find(u => u.email === email),
  createUser: (user) => {
    const newUser = { 
      id: userIdCounter++, 
      ...user, 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },
  updateUser: (id, data) => {
    const user = users.find(u => u.id === id);
    if (user) {
      Object.assign(user, data, { updated_at: new Date().toISOString() });
    }
    return user;
  },
  deleteUser: (id) => {
    users = users.filter(u => u.id !== id);
  },

  getAddressesByUser: (userId) => addresses.filter(a => a.user_id === userId),
  getAddressById: (id) => addresses.find(a => a.id === id),
  createAddress: (address) => {
    if (address.is_default) {
      addresses.filter(a => a.user_id === address.user_id).forEach(a => a.is_default = false);
    }
    const newAddress = { 
      id: addressIdCounter++, 
      ...address,
      created_at: new Date().toISOString()
    };
    addresses.push(newAddress);
    return newAddress;
  },
  updateAddress: (id, data) => {
    const address = addresses.find(a => a.id === id);
    if (address) {
      if (data.is_default) {
        addresses.filter(a => a.user_id === address.user_id).forEach(a => a.is_default = false);
      }
      Object.assign(address, data);
    }
    return address;
  },
  deleteAddress: (id) => {
    addresses = addresses.filter(a => a.id !== id);
  },

  getPaymentMethodsByUser: (userId) => paymentMethods.filter(p => p.user_id === userId),
  getPaymentMethodById: (id) => paymentMethods.find(p => p.id === id),
  createPaymentMethod: (payment) => {
    if (payment.is_default) {
      paymentMethods.filter(p => p.user_id === payment.user_id).forEach(p => p.is_default = false);
    }
    const newPayment = { 
      id: paymentIdCounter++, 
      ...payment,
      created_at: new Date().toISOString()
    };
    paymentMethods.push(newPayment);
    return newPayment;
  },
  updatePaymentMethod: (id, data) => {
    const payment = paymentMethods.find(p => p.id === id);
    if (payment) {
      if (data.is_default) {
        paymentMethods.filter(p => p.user_id === payment.user_id).forEach(p => p.is_default = false);
      }
      Object.assign(payment, data);
    }
    return payment;
  },
  deletePaymentMethod: (id) => {
    paymentMethods = paymentMethods.filter(p => p.id !== id);
  },

  getCartByUser: (userId) => cartItems.filter(c => c.user_id === userId),
  addToCart: (userId, bookId, quantity) => {
    const existing = cartItems.find(c => c.user_id === userId && c.book_id === bookId);
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }
    const item = { id: cartItems.length + 1, user_id: userId, book_id: bookId, quantity };
    cartItems.push(item);
    return item;
  },
  updateCartItem: (userId, bookId, quantity) => {
    const item = cartItems.find(c => c.user_id === userId && c.book_id === bookId);
    if (item) item.quantity = quantity;
    return item;
  },
  removeFromCart: (userId, bookId) => {
    cartItems = cartItems.filter(c => !(c.user_id === userId && c.book_id === bookId));
  },
  clearCart: (userId) => {
    cartItems = cartItems.filter(c => c.user_id !== userId);
  },

  getFavoritesByUser: (userId) => favorites.filter(f => f.user_id === userId),
  addToFavorites: (userId, bookId) => {
    if (!favorites.find(f => f.user_id === userId && f.book_id === bookId)) {
      favorites.push({ id: favorites.length + 1, user_id: userId, book_id: bookId, created_at: new Date().toISOString() });
    }
  },
  removeFromFavorites: (userId, bookId) => {
    favorites = favorites.filter(f => !(f.user_id === userId && f.book_id === bookId));
  },
  isFavorite: (userId, bookId) => !!favorites.find(f => f.user_id === userId && f.book_id === bookId),

  getOrdersByUser: (userId) => orders.filter(o => o.user_id === userId).map(o => ({
    ...o,
    items: orderItems.filter(oi => oi.order_id === o.id).map(oi => ({
      ...oi,
      book: books.find(b => b.id === oi.book_id)
    }))
  })),
  getOrderById: (id) => {
    const order = orders.find(o => o.id === id);
    if (!order) return null;
    return {
      ...order,
      items: orderItems.filter(oi => oi.order_id === order.id).map(oi => ({
        ...oi,
        book: books.find(b => b.id === oi.book_id)
      }))
    };
  },
  getAllOrders: () => orders.map(o => ({
    ...o,
    items: orderItems.filter(oi => oi.order_id === o.id).map(oi => ({
      ...oi,
      book: books.find(b => b.id === oi.book_id)
    }))
  })),
  createOrder: (orderData) => {
    const order = { 
      id: orderIdCounter++, 
      order_number: `ORD-${Date.now().toString(36).toUpperCase()}`,
      user_id: orderData.user_id,
      total_price: orderData.total_price,
      delivery_price: orderData.delivery_price,
      delivery_method: orderData.delivery_method,
      delivery_city: orderData.delivery_city,
      delivery_address: orderData.delivery_address,
      delivery_phone: orderData.delivery_phone,
      payment_method: orderData.payment_method,
      comment: orderData.comment,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    orders.push(order);
    
    if (orderData.items && orderData.items.length > 0) {
      orderData.items.forEach(item => {
        orderItems.push({
          id: orderItems.length + 1,
          order_id: order.id,
          book_id: item.book_id || item.id,
          quantity: item.quantity,
          price: item.price
        });
        
        const book = books.find(b => b.id === (item.book_id || item.id));
        if (book) {
          book.stock -= item.quantity;
          book.sales_count += item.quantity;
        }
      });
    }
    
    return {
      ...order,
      items: orderItems.filter(oi => oi.order_id === order.id).map(oi => ({
        ...oi,
        book: books.find(b => b.id === oi.book_id)
      }))
    };
  },
  updateOrderStatus: (id, status) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();
    }
    return order;
  },
  deleteOrder: (id) => {
    orderItems = orderItems.filter(oi => oi.order_id !== id);
    orders = orders.filter(o => o.id !== id);
  },

  getReviewsByBook: (bookId) => reviews.filter(r => r.book_id === bookId),
  getReviewsByUser: (userId) => reviews.filter(r => r.user_id === userId),
  createReview: (review) => {
    const newReview = {
      id: reviews.length + 1,
      ...review,
      is_approved: false,
      created_at: new Date().toISOString()
    };
    reviews.push(newReview);
    return newReview;
  },
  deleteReview: (id) => {
    reviews = reviews.filter(r => r.id !== id);
  },
};
