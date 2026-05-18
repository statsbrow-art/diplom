import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut, MapPin, CreditCard, ChevronRight, Truck, CheckCircle, Clock, XCircle, Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './Profile.css';

interface Address {
  id: number;
  city: string;
  street: string;
  building: string;
  apartment: string;
  is_default: boolean;
}

interface PaymentMethod {
  id: number;
  type: 'card' | 'erip';
  card_number?: string;
  card_holder?: string;
  expiry_date?: string;
  is_default: boolean;
}

interface OrderItem {
  book: {
    id: number;
    title: string;
    image_url: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_price: number;
  delivery_price: number;
  items: OrderItem[];
  created_at: string;
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Ожидает подтверждения', color: '#f59e0b', icon: <Clock size={16} /> },
  confirmed: { label: 'Подтверждён', color: '#3b82f6', icon: <CheckCircle size={16} /> },
  processing: { label: 'Комплектуется', color: '#8b5cf6', icon: <Package size={16} /> },
  shipped: { label: 'В доставке', color: '#06b6d4', icon: <Truck size={16} /> },
  delivered: { label: 'Доставлен', color: '#22c55e', icon: <CheckCircle size={16} /> },
  cancelled: { label: 'Отменён', color: '#ef4444', icon: <XCircle size={16} /> },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Profile: React.FC = () => {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [addressError, setAddressError] = useState('');

  const [addressForm, setAddressForm] = useState({
    city: '',
    street: '',
    building: '',
    apartment: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    card_number: '',
    card_holder: '',
    expiry_date: '',
  });

  const [settingsForm, setSettingsForm] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setSettingsForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      try {
        const [ordersData, addressesData, paymentsData] = await Promise.all([
          api.getOrders(),
          api.getAddresses(),
          api.getPaymentMethods(),
        ]);
        
        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(addressesData)) setAddresses(addressesData);
        if (Array.isArray(paymentsData)) setPaymentMethods(paymentsData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    const interval = setInterval(async () => {
      if (isAuthenticated) {
        try {
          const ordersData = await api.getOrders();
          if (Array.isArray(ordersData)) setOrders(ordersData);
        } catch (error) {}
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    api.logout();
    logout();
    navigate('/');
  };

  const openAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        city: address.city,
        street: address.street,
        building: address.building,
        apartment: address.apartment || '',
      });
    } else {
      setEditingAddress(null);
      setAddressForm({ city: '', street: '', building: '', apartment: '' });
    }
    setShowAddressModal(true);
  };

  const openPaymentModal = (payment?: PaymentMethod) => {
    if (payment) {
      setEditingPayment(payment);
      setPaymentForm({
        card_number: payment.card_number || '',
        card_holder: payment.card_holder || '',
        expiry_date: payment.expiry_date || '',
      });
    } else {
      setEditingPayment(null);
      setPaymentForm({ card_number: '', card_holder: '', expiry_date: '' });
    }
    setShowPaymentModal(true);
  };

  const saveAddress = async () => {
    if (!addressForm.city || !addressForm.street) {
      setAddressError('Заполните город и улицу');
      return;
    }
    if (!/^[A-Za-zА-Яа-яЁё\s.,\-\/]+$/.test(addressForm.street)) {
      setAddressError('Улица должна содержать только буквы');
      return;
    }
    if (addressForm.apartment && !/^\d+$/.test(addressForm.apartment)) {
      setAddressError('Квартира должна содержать только цифры');
      return;
    }
    setAddressError('');

    try {
      if (editingAddress) {
        const updated = await api.updateAddress(editingAddress.id, addressForm);
        setAddresses(prev => prev.map(a => a.id === editingAddress.id ? updated : a));
      } else {
        const newAddress = await api.createAddress({
          ...addressForm,
          is_default: addresses.length === 0,
        });
        setAddresses(prev => [...prev, newAddress]);
      }
      setShowAddressModal(false);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const deleteAddress = async (id: number) => {
    try {
      await api.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      await api.updateAddress(id, { is_default: true });
      setAddresses(prev => prev.map(a => ({
        ...a,
        is_default: a.id === id,
      })));
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    let formatted = '+';
    if (numbers.length <= 3) return '+' + numbers;
    formatted += numbers.slice(0, 3) + ' (';
    if (numbers.length <= 5) return formatted + numbers.slice(3);
    formatted += numbers.slice(3, 5) + ') ';
    if (numbers.length <= 8) return formatted + numbers.slice(5);
    formatted += numbers.slice(5, 8) + '-';
    if (numbers.length <= 10) return formatted + numbers.slice(8);
    formatted += numbers.slice(8, 10) + '-';
    formatted += numbers.slice(10, 12);
    return formatted;
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ').substr(0, 19) : '';
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  };

  const savePayment = async () => {
    if (!paymentForm.card_number || !paymentForm.card_holder) {
      setPaymentError('Заполните номер карты и имя держателя');
      return;
    }
    if (!validateCardNumber(paymentForm.card_number)) {
      setPaymentError('Номер карты должен содержать 16 цифр');
      return;
    }
    if (!validateCardHolder(paymentForm.card_holder)) {
      setPaymentError('Имя держателя должно содержать только буквы');
      return;
    }
    if (paymentForm.expiry_date && !validateExpiryDate(paymentForm.expiry_date)) {
      setPaymentError('Введите корректный срок действия карты (ММ/ГГ), месяц от 1 до 12');
      return;
    }
    setPaymentError('');

    try {
      if (editingPayment) {
        const updated = await api.updatePaymentMethod(editingPayment.id, {
          ...paymentForm,
          type: 'card',
        });
        setPaymentMethods(prev => prev.map(p => p.id === editingPayment.id ? updated : p));
      } else {
        const newPayment = await api.createPaymentMethod({
          ...paymentForm,
          type: 'card',
          is_default: paymentMethods.length === 0,
        });
        setPaymentMethods(prev => [...prev, newPayment]);
      }
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const deletePayment = async (id: number) => {
    try {
      await api.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const setDefaultPayment = async (id: number) => {
    try {
      await api.updatePaymentMethod(id, { is_default: true });
      setPaymentMethods(prev => prev.map(p => ({
        ...p,
        is_default: p.id === id,
      })));
    } catch (error) {
      console.error('Error setting default payment:', error);
    }
  };

  const maskCardNumber = (num: string) => {
    const clean = num.replace(/\s/g, '');
    return '**** **** **** ' + clean.slice(-4);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 11 && digits.length <= 12;
  };

  const validateCardNumber = (num: string): boolean => {
    const digits = num.replace(/\D/g, '');
    return digits.length === 16;
  };

  const validateExpiryDate = (exp: string): boolean => {
    if (!exp || exp.length < 5) return false;
    const [monthStr, yearStr] = exp.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt('20' + yearStr, 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const expDate = new Date(year, month);
    return expDate > now;
  };

  const validateCardHolder = (name: string): boolean => {
    return /^[A-Za-zА-Яа-яЁё\s]+$/.test(name) && name.trim().length >= 2;
  };

  const saveSettings = async () => {
    setSettingsMessage(null);
    if (!settingsForm.name.trim()) {
      setSettingsMessage({ type: 'error', text: 'Введите имя' });
      return;
    }
    if (settingsForm.name.trim().length < 2) {
      setSettingsMessage({ type: 'error', text: 'Имя должно содержать минимум 2 символа' });
      return;
    }
    if (settingsForm.phone && !validatePhone(settingsForm.phone)) {
      setSettingsMessage({ type: 'error', text: 'Введите корректный номер телефона (минимум 11 цифр)' });
      return;
    }
    if (settingsForm.newPassword && settingsForm.newPassword.length < 6) {
      setSettingsMessage({ type: 'error', text: 'Пароль должен содержать минимум 6 символов' });
      return;
    }
    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
      setSettingsMessage({ type: 'error', text: 'Пароли не совпадают' });
      return;
    }
    if (settingsForm.newPassword && !settingsForm.currentPassword) {
      setSettingsMessage({ type: 'error', text: 'Введите текущий пароль' });
      return;
    }
    setSettingsSaving(true);
    try {
      const data: any = { name: settingsForm.name, phone: settingsForm.phone };
      if (settingsForm.newPassword) {
        data.currentPassword = settingsForm.currentPassword;
        data.newPassword = settingsForm.newPassword;
      }
      const result = await api.updateProfile(data);
      if (result.error) {
        setSettingsMessage({ type: 'error', text: result.error });
      } else {
        updateUser({ name: result.name, phone: result.phone });
        setSettingsForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setSettingsMessage({ type: 'success', text: 'Данные сохранены' });
      }
    } catch (e) {
      setSettingsMessage({ type: 'error', text: 'Ошибка сервера' });
    } finally {
      setSettingsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-user">
              <div className="profile-avatar">
                <User size={24} />
              </div>
              <div className="profile-info">
                <h2>{user.name}</h2>
                <p>{user.email}</p>
              </div>
            </div>

            <nav className="profile-nav">
              <a href="#orders" className="profile-nav-item active">
                <Package size={20} />
                Мои заказы
                {orders.length > 0 && <span className="nav-badge">{orders.length}</span>}
              </a>
              <a href="#favorites" className="profile-nav-item" onClick={(e) => { e.preventDefault(); navigate('/favorites'); }}>
                <Heart size={20} />
                Избранное
              </a>
              <a href="#addresses" className="profile-nav-item">
                <MapPin size={20} />
                Адреса доставки
                {addresses.length > 0 && <span className="nav-badge">{addresses.length}</span>}
              </a>
              <a href="#payment" className="profile-nav-item">
                <CreditCard size={20} />
                Способы оплаты
                {paymentMethods.length > 0 && <span className="nav-badge">{paymentMethods.length}</span>}
              </a>
              <a href="#settings" className="profile-nav-item">
                <Settings size={20} />
                Настройки
              </a>
              <button className="profile-nav-item logout" onClick={handleLogout}>
                <LogOut size={20} />
                Выйти
              </button>
            </nav>
          </aside>

          <main className="profile-content">
            <section className="profile-section" id="orders">
              <h2>Мои заказы</h2>
              
              {orders.length === 0 ? (
                <div className="empty-state">
                  <Package size={64} />
                  <h3>У вас пока нет заказов</h3>
                  <p>Ваши заказы появятся здесь после оформления покупки</p>
                  <button onClick={() => navigate('/catalog')} className="btn btn-primary">
                    Перейти в каталог
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => {
                    const status = statusConfig[order.status as OrderStatus] || statusConfig.pending;
                    return (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-id">
                            <span className="order-number">Заказ #{order.order_number}</span>
                            <span className="order-date">{formatDate(order.created_at)}</span>
                          </div>
                          <div 
                            className="order-status"
                            style={{ background: `${status.color}15`, color: status.color }}
                          >
                            {status.icon}
                            {status.label}
                          </div>
                        </div>

                        <div className="order-items">
                          {order.items?.slice(0, 3).map((item, index) => (
                            <Link key={index} to={`/book/${item.book?.id}`} className="order-item-thumb">
                              <img src={item.book?.image_url} alt={item.book?.title} />
                              {item.quantity > 1 && (
                                <span className="item-qty">{item.quantity}</span>
                              )}
                            </Link>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="order-items-more">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>

                        <div className="order-footer">
                          <div className="order-total">
                            <span className="total-label">Итого:</span>
                            <span className="total-value">
                              {(Number(order.total_price) + Number(order.delivery_price)).toFixed(2)} р.
                            </span>
                          </div>
                          <button className="order-details-btn">
                            Подробнее
                            <ChevronRight size={18} />
                          </button>
                        </div>

                        <div className="order-progress">
                          <div className="progress-track">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: order.status === 'pending' ? '20%' 
                                  : order.status === 'confirmed' ? '40%'
                                  : order.status === 'processing' ? '60%'
                                  : order.status === 'shipped' ? '80%'
                                  : order.status === 'delivered' ? '100%'
                                  : '0%',
                                background: status.color
                              }}
                            ></div>
                          </div>
                          <div className="progress-steps">
                            <span className={order.status !== 'cancelled' ? 'active' : ''}>Оформлен</span>
                            <span className={['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'active' : ''}>Подтверждён</span>
                            <span className={['processing', 'shipped', 'delivered'].includes(order.status) ? 'active' : ''}>Собирается</span>
                            <span className={['shipped', 'delivered'].includes(order.status) ? 'active' : ''}>В пути</span>
                            <span className={order.status === 'delivered' ? 'active' : ''}>Доставлен</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="profile-section" id="addresses">
              <div className="section-header-row">
                <h2>Адреса доставки</h2>
                <button className="btn btn-sm btn-outline" onClick={() => openAddressModal()}>
                  <Plus size={18} />
                  Добавить
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <div className="empty-state-sm">
                  <MapPin size={48} />
                  <p>Нет сохранённых адресов</p>
                  <button className="btn btn-primary" onClick={() => openAddressModal()}>
                    Добавить адрес
                  </button>
                </div>
              ) : (
                <div className="addresses-grid">
                  {addresses.map(address => (
                    <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
                      {address.is_default && <span className="default-badge">Основной</span>}
                      <div className="address-content">
                        <p className="address-city">{address.city}</p>
                        <p className="address-street">{address.street}, д. {address.building}</p>
                        {address.apartment && <p className="address-apt">кв. {address.apartment}</p>}
                      </div>
                      <div className="address-actions">
                        {!address.is_default && (
                          <button className="action-btn" onClick={() => setDefaultAddress(address.id)} title="Сделать основным">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button className="action-btn" onClick={() => openAddressModal(address)} title="Редактировать">
                          <Edit2 size={16} />
                        </button>
                        <button className="action-btn delete" onClick={() => deleteAddress(address.id)} title="Удалить">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="profile-section" id="settings">
              <h2>Настройки профиля</h2>
              {settingsMessage && (
                <div className={`settings-message ${settingsMessage.type}`}>
                  {settingsMessage.text}
                </div>
              )}
              <div className="settings-form">
                <div className="form-group">
                  <label>Имя</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user?.email || ''} disabled className="disabled-input" />
                </div>
                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    type="tel"
                    value={settingsForm.phone}
                    onChange={e => setSettingsForm({ ...settingsForm, phone: formatPhoneNumber(e.target.value) })}
                    placeholder="+375 (29) 123-45-67"
                    maxLength={19}
                  />
                </div>
                <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Изменить пароль</h3>
                <div className="form-group">
                  <label>Текущий пароль</label>
                  <input
                    type="password"
                    value={settingsForm.currentPassword}
                    onChange={e => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Новый пароль</label>
                    <input
                      type="password"
                      value={settingsForm.newPassword}
                      onChange={e => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Подтвердите пароль</label>
                    <input
                      type="password"
                      value={settingsForm.confirmPassword}
                      onChange={e => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={saveSettings} disabled={settingsSaving}>
                  <Save size={18} />
                  {settingsSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </section>

            <section className="profile-section" id="payment">
              <div className="section-header-row">
                <h2>Способы оплаты</h2>
                <button className="btn btn-sm btn-outline" onClick={() => openPaymentModal()}>
                  <Plus size={18} />
                  Добавить
                </button>
              </div>
              
              {paymentMethods.length === 0 ? (
                <div className="empty-state-sm">
                  <CreditCard size={48} />
                  <p>Нет сохранённых способов оплаты</p>
                  <button className="btn btn-primary" onClick={() => openPaymentModal()}>
                    Добавить карту
                  </button>
                </div>
              ) : (
                <div className="payments-grid">
                  {paymentMethods.map(payment => (
                    <div key={payment.id} className={`payment-card ${payment.is_default ? 'default' : ''}`}>
                      {payment.is_default && <span className="default-badge">Основной</span>}
                      <div className="payment-icon">
                        <CreditCard size={32} />
                      </div>
                      <div className="payment-content">
                        <p className="card-number">{maskCardNumber(payment.card_number || '')}</p>
                        <p className="card-holder">{payment.card_holder}</p>
                        <p className="card-expiry">до {payment.expiry_date}</p>
                      </div>
                      <div className="payment-actions">
                        {!payment.is_default && (
                          <button className="action-btn" onClick={() => setDefaultPayment(payment.id)} title="Сделать основным">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button className="action-btn" onClick={() => openPaymentModal(payment)} title="Редактировать">
                          <Edit2 size={16} />
                        </button>
                        <button className="action-btn delete" onClick={() => deletePayment(payment.id)} title="Удалить">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAddress ? 'Редактировать адрес' : 'Новый адрес'}</h3>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {addressError && <div className="settings-message error">{addressError}</div>}
              <div className="form-group">
                <label>Город *</label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                  placeholder="Минск"
                />
              </div>
              <div className="form-group">
                <label>Улица *</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={e => setAddressForm({ ...addressForm, street: e.target.value.replace(/[^A-Za-zА-Яа-яЁё\s.,\-\/]/g, '') })}
                  placeholder="пр-т Независимости"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Дом</label>
                  <input
                    type="text"
                    value={addressForm.building}
                    onChange={e => setAddressForm({ ...addressForm, building: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div className="form-group">
                  <label>Квартира</label>
                  <input
                    type="text"
                    value={addressForm.apartment}
                    onChange={e => setAddressForm({ ...addressForm, apartment: e.target.value.replace(/\D/g, '') })}
                    placeholder="25"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddressModal(false)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={saveAddress}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPayment ? 'Редактировать карту' : 'Новая карта'}</h3>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {paymentError && <div className="settings-message error">{paymentError}</div>}
              <div className="form-group">
                <label>Номер карты *</label>
                <input
                  type="text"
                  value={paymentForm.card_number}
                  onChange={e => setPaymentForm({ ...paymentForm, card_number: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div className="form-group">
                <label>Имя держателя *</label>
                <input
                  type="text"
                  value={paymentForm.card_holder}
                  onChange={e => setPaymentForm({ ...paymentForm, card_holder: e.target.value.replace(/[^A-Za-zА-Яа-яЁё\s]/g, '').toUpperCase() })}
                  placeholder="IVAN IVANOV"
                />
              </div>
              <div className="form-group">
                <label>Срок действия</label>
                <input
                  type="text"
                  value={paymentForm.expiry_date}
                  onChange={e => setPaymentForm({ ...paymentForm, expiry_date: formatExpiryDate(e.target.value) })}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={savePayment}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
