import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Truck, Shield, ArrowLeft, Star, Send } from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import BookCard from '../../components/BookCard/BookCard';
import { Book } from '../../types';
import './BookDetails.css';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const mapBookFromApi = (b: any): Book => ({
    id: b.id,
    title: b.title,
    author: b.author_name || b.author,
    price: Number(b.price),
    oldPrice: b.old_price ? Number(b.old_price) : undefined,
    discount: b.discount || 0,
    image: b.image_url || b.image,
    category: b.category_name || b.category,
    year: b.year,
    rating: Number(b.rating),
    inStock: b.stock > 0 || b.is_active !== false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookData, booksResponse] = await Promise.all([
          api.getBook(Number(id)),
          api.getBooks({}),
        ]);
        
        if (bookData && !bookData.error) {
          setBook(mapBookFromApi(bookData));
        }

        const allBooks = Array.isArray(booksResponse) ? booksResponse : booksResponse.books || [];
        setRelatedBooks(
          allBooks
            .filter((b: any) => b.id !== Number(id))
            .slice(0, 4)
            .map(mapBookFromApi)
        );

        try {
          const reviewsData = await api.getReviews(Number(id));
          if (Array.isArray(reviewsData)) setReviews(reviewsData);
        } catch (e) { /* reviews optional */ }
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="book-details-page">
        <div className="container">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-details-page">
        <div className="container">
          <div className="not-found">
            <h2>Книга не найдена</h2>
            <Link to="/catalog" className="btn btn-primary">
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isBookFavorite = isFavorite(book.id);

  return (
    <div className="book-details-page">
      <div className="container">
        <Link to="/catalog" className="back-link">
          <ArrowLeft size={20} />
          Назад в каталог
        </Link>

        <div className="book-details">
          <div className="book-details-image">
            <img src={book.image} alt={book.title} onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=' + encodeURIComponent(book.title); }} />
            {book.discount && book.discount > 0 && (
              <span className="book-discount">-{book.discount}%</span>
            )}
          </div>

          <div className="book-details-info">
            <h1>{book.title}</h1>
            <p className="book-author">{book.author}</p>

            <div className="book-rating">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.floor(book.rating) ? '#ffc107' : 'none'}
                  color={i < Math.floor(book.rating) ? '#ffc107' : '#ddd'}
                />
              ))}
              <span>{book.rating}</span>
            </div>

            <div className="book-price-block">
              <div className="book-price">
                <span className="current-price">{book.price.toFixed(2)} р.</span>
                {book.oldPrice && (
                  <span className="old-price">{book.oldPrice.toFixed(2)} р.</span>
                )}
              </div>
              {book.discount && book.discount > 0 && book.oldPrice && (
                <span className="economy">
                  Выгода: {(book.oldPrice - book.price).toFixed(2)} р.
                </span>
              )}
            </div>

            <div className="book-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={() => addToCart(book)}
              >
                <ShoppingCart size={20} />
                Добавить в корзину
              </button>
              <button 
                className={`btn btn-outline-icon ${isBookFavorite ? 'active' : ''}`}
                onClick={() => toggleFavorite(book)}
              >
                <Heart size={24} fill={isBookFavorite ? '#e94560' : 'none'} />
              </button>
            </div>

            <div className="book-features">
              <div className="feature">
                <Truck size={24} />
                <div>
                  <strong>Доставка</strong>
                  <span>1-3 дня по всей Беларуси</span>
                </div>
              </div>
              <div className="feature">
                <Shield size={24} />
                <div>
                  <strong>Гарантия</strong>
                  <span>Оригинальное издание</span>
                </div>
              </div>
            </div>

            <div className="book-meta">
              <div className="meta-item">
                <span className="meta-label">Категория:</span>
                <span className="meta-value">{book.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Год издания:</span>
                <span className="meta-value">{book.year}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Наличие:</span>
                <span className="meta-value in-stock">
                  {book.inStock ? 'В наличии' : 'Нет в наличии'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <section className="reviews-section">
          <h2>Отзывы ({reviews.length})</h2>
          
          {isAuthenticated && (
            <div className="review-form">
              <h3>Оставить отзыв</h3>
              <div className="review-rating-input">
                <span>Оценка:</span>
                <div className="rating-stars-input">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={24}
                      fill={(hoverRating || reviewRating) >= s ? '#ffc107' : 'none'}
                      color={(hoverRating || reviewRating) >= s ? '#ffc107' : '#ddd'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setReviewRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
              </div>
              <textarea
                className="review-textarea"
                rows={3}
                placeholder="Напишите ваш отзыв..."
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
              />
              <button
                className="btn btn-primary"
                disabled={reviewSubmitting}
                onClick={async () => {
                  setReviewSubmitting(true);
                  try {
                    const review = await api.createReview(Number(id), {
                      rating: reviewRating,
                      comment: reviewComment,
                    });
                    if (review && !review.error) {
                      setReviews(prev => [review, ...prev]);
                      setReviewComment('');
                      setReviewRating(5);
                    }
                  } catch (e) { console.error(e); }
                  finally { setReviewSubmitting(false); }
                }}
              >
                <Send size={16} />
                {reviewSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="no-reviews">Пока нет отзывов. Будьте первым!</p>
          ) : (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <strong>{review.user_name}</strong>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={14} fill={s <= review.rating ? '#ffc107' : 'none'} color={s <= review.rating ? '#ffc107' : '#ddd'} />
                      ))}
                    </div>
                    <span className="review-date">{new Date(review.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  {review.comment && <p className="review-text">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="related-books">
          <h2>Вам может понравиться</h2>
          <div className="books-grid">
            {relatedBooks.map(relatedBook => (
              <BookCard key={relatedBook.id} book={relatedBook} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookDetails;
