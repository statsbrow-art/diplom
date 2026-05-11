import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import './Favorites.css';

const Favorites: React.FC = () => {
  const { favorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();

  if (favorites.length === 0) {
    return (
      <div className="favorites-page">
        <div className="container">
          <div className="favorites-empty">
            <Heart size={80} />
            <h2>В избранном пока пусто</h2>
            <p>Добавляйте книги, которые вам понравились, чтобы не потерять их</p>
            <Link to="/catalog" className="btn btn-primary">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="favorites-header">
          <h1>Избранное</h1>
          <span className="favorites-count">{favorites.length} товаров</span>
        </div>

        <div className="favorites-grid">
          {favorites.map(book => (
            <div key={book.id} className="favorite-card">
              <Link to={`/book/${book.id}`} className="favorite-image">
                <img src={book.image} alt={book.title} />
                {book.discount && (
                  <span className="favorite-discount">-{book.discount}%</span>
                )}
              </Link>
              <div className="favorite-content">
                <div className="favorite-price">
                  <span className="current-price">{book.price.toFixed(2)} р.</span>
                  {book.oldPrice && (
                    <span className="old-price">{book.oldPrice.toFixed(2)} р.</span>
                  )}
                </div>
                <Link to={`/book/${book.id}`} className="favorite-title">
                  {book.title}
                </Link>
                <p className="favorite-author">{book.author}</p>
                <div className="favorite-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(book)}
                  >
                    В корзину
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromFavorites(book.id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;

