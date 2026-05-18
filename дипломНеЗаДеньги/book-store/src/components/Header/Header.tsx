import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, Settings } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import './Header.css';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="header-contacts">
              <span>Служба поддержки: +375 (29) 123-45-67</span>
            </div>
            <nav className="header-nav-top">
              <Link to="/delivery">Доставка</Link>
              <Link to="/payment">Оплата</Link>
              <Link to="/stores">Магазины</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            <button 
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/" className="logo">
              <span className="logo-text">BookStore</span>
            </Link>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Поиск книг, авторов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <Search size={20} />
              </button>
            </form>

            <div className="header-actions">
              <Link to="/favorites" className="header-action">
                <Heart size={24} />
                {favorites.length > 0 && (
                  <span className="favorites-badge">{favorites.length}</span>
                )}
                <span>Избранное</span>
              </Link>
              {isAuthenticated && (user as any)?.role === 'admin' && (
                <Link to="/admin" className="header-action">
                  <Settings size={24} />
                  <span>Админ</span>
                </Link>
              )}
              <Link to={isAuthenticated ? "/profile" : "/auth"} className="header-action">
                <User size={24} />
                <span>{isAuthenticated ? user?.name : 'Войти'}</span>
              </Link>
              <Link to="/cart" className="header-action cart-action">
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
                <span>Корзина</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
        <div className="container">
          <ul className="nav-list">
            <li><Link to="/catalog">Все товары</Link></li>
            <li><Link to="/catalog?category=fiction">Художественная литература</Link></li>
            <li><Link to="/catalog?category=non-fiction">Нехудожественная литература</Link></li>
            <li><Link to="/catalog?category=children">Детские книги</Link></li>
            <li><Link to="/catalog?category=business">Бизнес-литература</Link></li>
            <li><Link to="/catalog?category=comics">Комиксы и манга</Link></li>
            <li><Link to="/sale" className="sale-link">Акции</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
