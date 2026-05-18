import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Truck, CreditCard, Banknote, Building, CheckCircle, ArrowLeft, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { api } from '../../services/api';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import './Checkout.css';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { createOrder } = useOrders();

  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pickup' | 'post'>('courier');
  const [city, setCity] = useState('Минск');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'erip'>('card');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const deliveryPrice = deliveryMethod === 'pickup' ? 0 : totalPrice >= 50 ? 0 : deliveryMethod === 'courier' ? 5 : 3;
  const finalPrice = Math.max(0, totalPrice + deliveryPrice - promoDiscount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoMessage(null);
    try {
      const result = await api.validatePromo(promoCode, totalPrice);
      if (result.error) {
        setPromoMessage({ type: 'error', text: result.error });
        setPromoDiscount(0);
      } else if (result.valid) {
        setPromoDiscount(result.discount);
        setPromoMessage({ type: 'success', text: `Промокод применён! Скидка: ${result.discount.toFixed(2)} р.` });
      }
    } catch (e) {
      setPromoMessage({ type: 'error', text: 'Ошибка проверки промокода' });
    } finally {
      setPromoLoading(false);
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (deliveryMethod !== 'pickup') {
      if (!address.trim()) {
        newErrors.address = 'Введите адрес';
      } else if (!/^[A-Za-zА-Яа-яЁё\s.,\-\/0-9]+$/.test(address.trim())) {
        newErrors.address = 'Адрес содержит недопустимые символы';
      }
      if (!city.trim()) newErrors.city = 'Выберите город';
      if (apartment && !/^\d+$/.test(apartment.trim())) {
        newErrors.apartment = 'Квартира должна содержать только цифры';
      }
    }
    if (!phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else {
      const phoneDigits = phone.replace(/\D/g, '');
      if (!phoneDigits.startsWith('375') || phoneDigits.length !== 12) {
        newErrors.phone = 'Телефон должен быть в формате +375 и содержать 9 цифр после кода';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmitOrder = () => {
    if (!isAuthenticated || !user) {
      navigate('/auth');
      return;
    }

    const orderItems = items.map(item => ({
      book: item.book,
      quantity: item.quantity,
      price: item.book.price,
    }));

    const order = createOrder(
      orderItems,
      {
        method: deliveryMethod,
        city,
        address,
        apartment,
        phone,
        comment,
      },
      paymentMethod,
      user.id
    );

    setOrderId(order.id);
    setOrderComplete(true);
    clearCart();
  };

  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-auth-required">
            <h2>Для оформления заказа необходимо войти</h2>
            <p>Войдите в аккаунт или зарегистрируйтесь, чтобы продолжить</p>
            <Link to="/auth" className="btn btn-primary">Войти</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <h2>Корзина пуста</h2>
            <p>Добавьте товары для оформления заказа</p>
            <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">
              <CheckCircle size={80} />
            </div>
            <h1>Заказ оформлен!</h1>
            <p className="order-number">Номер заказа: <strong>{orderId}</strong></p>
            <p className="order-info">
              Мы отправили подтверждение на вашу почту. 
              Вы можете отслеживать статус заказа в личном кабинете.
            </p>
            <div className="success-actions">
              <Link to="/profile" className="btn btn-primary">Мои заказы</Link>
              <Link to="/catalog" className="btn btn-outline">Продолжить покупки</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <Link to="/cart" className="back-link">
          <ArrowLeft size={20} />
          Вернуться в корзину
        </Link>

        <h1>Оформление заказа</h1>

        <div className="checkout-steps">
          <div className={`checkout-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-title">Доставка</span>
          </div>
          <div className="step-line"></div>
          <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-title">Оплата</span>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-form">
            {step === 1 && (
              <div className="checkout-section">
                <h2>Способ доставки</h2>
                
                <div className="delivery-options">
                  <label className={`delivery-option ${deliveryMethod === 'courier' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="courier"
                      checked={deliveryMethod === 'courier'}
                      onChange={() => setDeliveryMethod('courier')}
                    />
                    <Truck size={24} />
                    <div className="option-info">
                      <span className="option-title">Курьером</span>
                      <span className="option-desc">1-2 дня, {totalPrice >= 50 ? 'бесплатно' : '5 р.'}</span>
                    </div>
                  </label>

                  <label className={`delivery-option ${deliveryMethod === 'pickup' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={deliveryMethod === 'pickup'}
                      onChange={() => setDeliveryMethod('pickup')}
                    />
                    <MapPin size={24} />
                    <div className="option-info">
                      <span className="option-title">Самовывоз</span>
                      <span className="option-desc">Сегодня, бесплатно</span>
                    </div>
                  </label>

                  <label className={`delivery-option ${deliveryMethod === 'post' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="post"
                      checked={deliveryMethod === 'post'}
                      onChange={() => setDeliveryMethod('post')}
                    />
                    <Building size={24} />
                    <div className="option-info">
                      <span className="option-title">Белпочта</span>
                      <span className="option-desc">3-5 дней, {totalPrice >= 50 ? 'бесплатно' : '3 р.'}</span>
                    </div>
                  </label>
                </div>

                {deliveryMethod !== 'pickup' && (
                  <div className="address-form">
                    <h3>Адрес доставки</h3>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <CustomSelect
                          label="Город"
                          value={city}
                          onChange={setCity}
                          options={[
                            { value: 'Минск', label: 'Минск' },
                            { value: 'Гомель', label: 'Гомель' },
                            { value: 'Брест', label: 'Брест' },
                            { value: 'Гродно', label: 'Гродно' },
                            { value: 'Витебск', label: 'Витебск' },
                            { value: 'Могилёв', label: 'Могилёв' },
                          ]}
                        />
                        {errors.city && <span className="error">{errors.city}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group flex-2">
                        <label>Улица, дом</label>
                        <input
                          type="text"
                          placeholder="пр-т Независимости, 1"
                          value={address}
                          onChange={(e) => setAddress(e.target.value.replace(/[^A-Za-zА-Яа-яЁё\s.,\-\/0-9]/g, ''))}
                          className={errors.address ? 'error' : ''}
                        />
                        {errors.address && <span className="error">{errors.address}</span>}
                      </div>
                      <div className="form-group">
                        <label>Квартира</label>
                        <input
                          type="text"
                          placeholder="12"
                          value={apartment}
                          onChange={(e) => setApartment(e.target.value.replace(/\D/g, ''))}
                        />
                        {errors.apartment && <span className="error">{errors.apartment}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {deliveryMethod === 'pickup' && (
                  <div className="pickup-info">
                    <h3>Пункт самовывоза</h3>
                    <div className="pickup-address">
                      <MapPin size={20} />
                      <div>
                        <strong>ТЦ "Галерея"</strong>
                        <span>пр-т Победителей, 9, 2 этаж</span>
                        <span className="pickup-hours">Пн-Вс: 10:00 - 22:00</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="contact-info">
                  <h3>Контактные данные</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Телефон</label>
                      <input
                        type="tel"
                        placeholder="+375 (29) 123-45-67"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          const digits = val.replace(/\D/g, '');
                          if (digits.length === 0) { setPhone(''); return; }
                          let formatted = '+';
                          if (digits.length <= 3) { formatted += digits; }
                          else if (digits.length <= 5) { formatted += digits.slice(0, 3) + ' (' + digits.slice(3); }
                          else if (digits.length <= 8) { formatted += digits.slice(0, 3) + ' (' + digits.slice(3, 5) + ') ' + digits.slice(5); }
                          else if (digits.length <= 10) { formatted += digits.slice(0, 3) + ' (' + digits.slice(3, 5) + ') ' + digits.slice(5, 8) + '-' + digits.slice(8); }
                          else { formatted += digits.slice(0, 3) + ' (' + digits.slice(3, 5) + ') ' + digits.slice(5, 8) + '-' + digits.slice(8, 10) + '-' + digits.slice(10, 12); }
                          setPhone(formatted);
                        }}
                        className={errors.phone ? 'error' : ''}
                      />
                      {errors.phone && <span className="error">{errors.phone}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Комментарий к заказу</label>
                    <textarea
                      rows={3}
                      placeholder="Дополнительная информация для курьера..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>

                <button className="btn btn-primary btn-large" onClick={handleNextStep}>
                  Продолжить
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-section">
                <h2>Способ оплаты</h2>
                
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <CreditCard size={24} />
                    <div className="option-info">
                      <span className="option-title">Банковской картой онлайн</span>
                      <span className="option-desc">Visa, MasterCard, Белкарт</span>
                    </div>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                    />
                    <Banknote size={24} />
                    <div className="option-info">
                      <span className="option-title">Наличными при получении</span>
                      <span className="option-desc">Оплата курьеру или в пункте выдачи</span>
                    </div>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'erip' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="erip"
                      checked={paymentMethod === 'erip'}
                      onChange={() => setPaymentMethod('erip')}
                    />
                    <Building size={24} />
                    <div className="option-info">
                      <span className="option-title">ЕРИП</span>
                      <span className="option-desc">Система "Расчёт"</span>
                    </div>
                  </label>
                </div>

                <div className="checkout-actions">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>
                    Назад
                  </button>
                  <button className="btn btn-primary btn-large" onClick={handleSubmitOrder}>
                    Оформить заказ
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-summary">
            <h2>Ваш заказ</h2>
            
            <div className="summary-items">
              {items.map(({ book, quantity }) => (
                <div key={book.id} className="summary-item">
                  <img src={book.image} alt={book.title} />
                  <div className="summary-item-info">
                    <span className="summary-item-title">{book.title}</span>
                    <span className="summary-item-qty">{quantity} шт.</span>
                  </div>
                  <span className="summary-item-price">{(book.price * quantity).toFixed(2)} р.</span>
                </div>
              ))}
            </div>

            <div className="promo-section">
              <div className="promo-input-group">
                <Tag size={18} />
                <input
                  type="text"
                  placeholder="Промокод"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  className="promo-input"
                />
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleApplyPromo}
                  disabled={promoLoading}
                >
                  {promoLoading ? '...' : 'Применить'}
                </button>
              </div>
              {promoMessage && (
                <div className={`promo-message ${promoMessage.type}`}>
                  {promoMessage.text}
                </div>
              )}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Товары ({items.reduce((sum, i) => sum + i.quantity, 0)})</span>
                <span>{totalPrice.toFixed(2)} р.</span>
              </div>
              <div className="summary-row">
                <span>Доставка</span>
                <span>{deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice.toFixed(2)} р.`}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="summary-row discount">
                  <span>Скидка по промокоду</span>
                  <span>-{promoDiscount.toFixed(2)} р.</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Итого</span>
                <span>{finalPrice.toFixed(2)} р.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

