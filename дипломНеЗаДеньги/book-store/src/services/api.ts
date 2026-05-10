const API_URL = 'http://localhost:5001/api';

const getToken = () => localStorage.getItem('token');

const headers = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  async getBooks(params?: { category?: string; search?: string; sort?: string; minPrice?: number; maxPrice?: number }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.minPrice) query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
    const res = await fetch(`${API_URL}/books?${query}`);
    return res.json();
  },

  async getBook(id: number) {
    const res = await fetch(`${API_URL}/books/${id}`);
    return res.json();
  },

  async getBestsellers() {
    const res = await fetch(`${API_URL}/books/bestsellers`);
    return res.json();
  },

  async getNewBooks() {
    const res = await fetch(`${API_URL}/books/new`);
    return res.json();
  },

  async getDiscountedBooks() {
    const res = await fetch(`${API_URL}/books/discounted`);
    return res.json();
  },

  async searchBooks(query: string) {
    const res = await fetch(`${API_URL}/books/search?q=${encodeURIComponent(query)}`);
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_URL}/categories`);
    return res.json();
  },

  async getCategory(slug: string) {
    const res = await fetch(`${API_URL}/categories/${slug}`);
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    return result;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    return result;
  },

  async getMe() {
    const res = await fetch(`${API_URL}/auth/me`, { headers: headers() });
    return res.json();
  },

  async updateProfile(data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  logout() {
    localStorage.removeItem('token');
  },

  async getAddresses() {
    const res = await fetch(`${API_URL}/addresses`, { headers: headers() });
    return res.json();
  },

  async createAddress(data: { city: string; street: string; building: string; apartment?: string; is_default?: boolean }) {
    const res = await fetch(`${API_URL}/addresses`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateAddress(id: number, data: { city?: string; street?: string; building?: string; apartment?: string; is_default?: boolean }) {
    const res = await fetch(`${API_URL}/addresses/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteAddress(id: number) {
    const res = await fetch(`${API_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  async getPaymentMethods() {
    const res = await fetch(`${API_URL}/payment-methods`, { headers: headers() });
    return res.json();
  },

  async createPaymentMethod(data: { type: string; card_number: string; card_holder: string; expiry_date: string; is_default?: boolean }) {
    const res = await fetch(`${API_URL}/payment-methods`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updatePaymentMethod(id: number, data: { type?: string; card_number?: string; card_holder?: string; expiry_date?: string; is_default?: boolean }) {
    const res = await fetch(`${API_URL}/payment-methods/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deletePaymentMethod(id: number) {
    const res = await fetch(`${API_URL}/payment-methods/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  async getCart() {
    const res = await fetch(`${API_URL}/cart`, { headers: headers() });
    return res.json();
  },

  async addToCart(bookId: number, quantity = 1) {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ bookId, quantity }),
    });
    return res.json();
  },

  async updateCartItem(bookId: number, quantity: number) {
    const res = await fetch(`${API_URL}/cart/${bookId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ quantity }),
    });
    return res.json();
  },

  async removeFromCart(bookId: number) {
    const res = await fetch(`${API_URL}/cart/${bookId}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  async clearCart() {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  async getFavorites() {
    const res = await fetch(`${API_URL}/favorites`, { headers: headers() });
    return res.json();
  },

  async addToFavorites(bookId: number) {
    const res = await fetch(`${API_URL}/favorites/${bookId}`, {
      method: 'POST',
      headers: headers(),
    });
    return res.json();
  },

  async removeFromFavorites(bookId: number) {
    const res = await fetch(`${API_URL}/favorites/${bookId}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  async checkFavorite(bookId: number) {
    const res = await fetch(`${API_URL}/favorites/check/${bookId}`, { headers: headers() });
    return res.json();
  },

  async getOrders() {
    const res = await fetch(`${API_URL}/orders`, { headers: headers() });
    return res.json();
  },

  async getOrder(id: number) {
    const res = await fetch(`${API_URL}/orders/${id}`, { headers: headers() });
    return res.json();
  },

  async createOrder(data: { items: any[]; delivery: any; paymentMethod: string }) {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async cancelOrder(id: number) {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  async getStores() {
    const res = await fetch(`${API_URL}/stores`);
    return res.json();
  },

  async getStore(id: number) {
    const res = await fetch(`${API_URL}/stores/${id}`);
    return res.json();
  },

  async checkHealth() {
    const res = await fetch(`${API_URL}/health`);
    return res.json();
  },

  isAuthenticated() {
    return !!getToken();
  },

  // Reviews
  async getReviews(bookId: number) {
    const res = await fetch(`${API_URL}/books/${bookId}/reviews`);
    return res.json();
  },

  async createReview(bookId: number, data: { rating: number; comment: string }) {
    const res = await fetch(`${API_URL}/books/${bookId}/reviews`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Promo codes
  async validatePromo(code: string, orderAmount: number) {
    const res = await fetch(`${API_URL}/promo/validate`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ code, orderAmount }),
    });
    return res.json();
  },

  // Admin API
  async getAdminStats() {
    const res = await fetch(`${API_URL}/admin/stats`, { headers: headers() });
    return res.json();
  },

  async getAdminUsers() {
    const res = await fetch(`${API_URL}/admin/users`, { headers: headers() });
    return res.json();
  },

  async updateUserRole(id: number, role: string) {
    const res = await fetch(`${API_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  async deleteUser(id: number) {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  async getAdminOrders() {
    const res = await fetch(`${API_URL}/admin/orders`, { headers: headers() });
    return res.json();
  },

  async updateOrderStatus(id: number, status: string) {
    const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getAdminBooks() {
    const res = await fetch(`${API_URL}/admin/books`, { headers: headers() });
    return res.json();
  },

  async createBook(data: Record<string, unknown>) {
    const res = await fetch(`${API_URL}/admin/books`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateBook(id: number, data: Record<string, unknown>) {
    const res = await fetch(`${API_URL}/admin/books/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteBook(id: number) {
    const res = await fetch(`${API_URL}/admin/books/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  async getAdminPromos() {
    const res = await fetch(`${API_URL}/admin/promo`, { headers: headers() });
    return res.json();
  },

  async createPromo(data: Record<string, unknown>) {
    const res = await fetch(`${API_URL}/admin/promo`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updatePromo(id: number, data: Record<string, unknown>) {
    const res = await fetch(`${API_URL}/admin/promo/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deletePromo(id: number) {
    const res = await fetch(`${API_URL}/admin/promo/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  async getAdminReviews() {
    const res = await fetch(`${API_URL}/admin/reviews`, { headers: headers() });
    return res.json();
  },

  async deleteReview(id: number) {
    const res = await fetch(`${API_URL}/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },
};

export default api;
