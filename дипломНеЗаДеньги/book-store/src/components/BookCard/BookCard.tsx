import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Book } from '../../types';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import './BookCard.css';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isBookFavorite = isFavorite(book.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(book);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(book);
  };

  return (
    <Link to={`/book/${book.id}`} className="book-card">
      <div className="book-card-image">
        <img src={book.image} alt={book.title} onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=' + encodeURIComponent(book.title); }} />
        {book.discount && (
          <span className="book-discount">-{book.discount}%</span>
        )}
        <button 
          className={`book-favorite ${isBookFavorite ? 'active' : ''}`} 
          onClick={handleToggleFavorite}
        >
          <Heart size={18} fill={isBookFavorite ? '#e94560' : 'none'} />
        </button>
      </div>
      <div className="book-card-content">
        <div className="book-card-price">
          <span className="current-price">{book.price.toFixed(2)} р.</span>
          {book.oldPrice && (
            <span className="old-price">{book.oldPrice.toFixed(2)} р.</span>
          )}
        </div>
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          <ShoppingCart size={18} />
          <span>В корзину</span>
        </button>
      </div>
    </Link>
  );
};

export default BookCard;
