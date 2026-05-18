import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <ShoppingBag size={80} />
            <h2>Корзина пуста</h2>
            <p>Добавьте книги, которые хотите приобрести</p>
            <Link to="/catalog" className="btn btn-primary">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Корзина</h1>
          <button className="clear-cart" onClick={clearCart}>
            Очистить корзину
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {items.map(({ book, quantity }) => (
              <div key={book.id} className="cart-item">
                <Link to={`/book/${book.id}`} className="cart-item-image">
                  <img src={book.image} alt={book.title} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/book/${book.id}`} className="cart-item-title">
                    {book.title}
                  </Link>
                  <p className="cart-item-author">{book.author}</p>
                  <div className="cart-item-stock">В наличии</div>
                </div>
                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateQuantity(book.id, quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => updateQuantity(book.id, quantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className="cart-item-price">
                  <span className="item-total">
                    {(book.price * quantity).toFixed(2)} р.
                  </span>
                  {quantity > 1 && (
                    <span className="item-unit">{book.price.toFixed(2)} р./шт.</span>
                  )}
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(book.id)}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Итого</h2>
            <div className="summary-row">
              <span>Товаров:</span>
              <span>{items.reduce((sum, item) => sum + item.quantity, 0)} шт.</span>
            </div>
            <div className="summary-row">
              <span>Сумма:</span>
              <span>{totalPrice.toFixed(2)} р.</span>
            </div>
            <div className="summary-row">
              <span>Доставка:</span>
              <span>{totalPrice >= 50 ? 'Бесплатно' : '5.00 р.'}</span>
            </div>
            <div className="summary-total">
              <span>К оплате:</span>
              <span>
                {(totalPrice + (totalPrice >= 50 ? 0 : 5)).toFixed(2)} р.
              </span>
            </div>
            <Link to="/checkout" className="checkout-btn">
              Оформить заказ
            </Link>
            <p className="free-delivery-info">
              {totalPrice < 50 &&
                `До бесплатной доставки осталось ${(50 - totalPrice).toFixed(2)} р.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

