import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">BookStore</h3>
            <p className="footer-description">
              Интернет-магазин книг с доставкой по всей Беларуси
            </p>
            <div className="footer-contacts">
              <p>+375 (29) 123-45-67</p>
              <p>info@bookstore.by</p>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Покупателям</h4>
            <ul className="footer-links">
              <li><Link to="/delivery">Доставка</Link></li>
              <li><Link to="/payment">Оплата</Link></li>
              <li><Link to="/return">Возврат товара</Link></li>
              <li><Link to="/faq">Вопросы и ответы</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Каталог</h4>
            <ul className="footer-links">
              <li><Link to="/catalog?category=fiction">Художественная литература</Link></li>
              <li><Link to="/catalog?category=non-fiction">Нехудожественная литература</Link></li>
              <li><Link to="/catalog?category=children">Детские книги</Link></li>
              <li><Link to="/catalog?category=business">Бизнес-литература</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Компания</h4>
            <ul className="footer-links">
              <li><Link to="/about">О нас</Link></li>
              <li><Link to="/stores">Магазины</Link></li>
              <li><Link to="/contacts">Контакты</Link></li>
              <li><Link to="/vacancies">Вакансии</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2024 BookStore. Все права защищены.
          </div>
          <div className="footer-payments">
            <span className="payment-method">Visa</span>
            <span className="payment-method">MasterCard</span>
            <span className="payment-method">БЕЛКАРТ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

