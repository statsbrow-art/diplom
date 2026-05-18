import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, CreditCard, Shield, Clock } from 'lucide-react';
import BookCard from '../../components/BookCard/BookCard';
import { api } from '../../services/api';
import { Book } from '../../types';
import './Home.css';

const Home: React.FC = () => {
  const [bestsellers, setBestsellers] = useState<Book[]>([]);
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [discountedBooks, setDiscountedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bestsellersData, newData, discountedData] = await Promise.all([
          api.getBestsellers(),
          api.getNewBooks(),
          api.getDiscountedBooks(),
        ]);
        setBestsellers(bestsellersData.map(mapBookFromApi).slice(0, 4));
        setNewArrivals(newData.map(mapBookFromApi).slice(0, 4));
        setDiscountedBooks(discountedData.map(mapBookFromApi).slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Книги, которые вдохновляют</h1>
              <p>Более 100 000 книг с доставкой по всей Беларуси. Найдите свою следующую любимую книгу!</p>
              <div className="hero-buttons">
                <Link to="/catalog" className="btn btn-primary">
                  Смотреть каталог
                  <ArrowRight size={20} />
                </Link>
                <Link to="/sale" className="btn btn-outline">
                  Акции и скидки
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img 
                src="https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" 
                alt="Книги"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <Truck size={32} />
              <div>
                <h3>Быстрая доставка</h3>
                <p>По всей Беларуси за 1-3 дня</p>
              </div>
            </div>
            <div className="feature-item">
              <CreditCard size={32} />
              <div>
                <h3>Удобная оплата</h3>
                <p>Картой или наличными</p>
              </div>
            </div>
            <div className="feature-item">
              <Shield size={32} />
              <div>
                <h3>Гарантия качества</h3>
                <p>Только оригинальные издания</p>
              </div>
            </div>
            <div className="feature-item">
              <Clock size={32} />
              <div>
                <h3>Поддержка 24/7</h3>
                <p>Всегда на связи</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="books-section">
        <div className="container">
          <div className="section-header">
            <h2>Бестселлеры</h2>
            <Link to="/catalog?sort=popular" className="view-all">
              Смотреть все <ArrowRight size={16} />
            </Link>
          </div>
          <div className="books-grid">
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              bestsellers.map(book => (
                <BookCard key={book.id} book={book} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="promo-banner">
        <div className="container">
          <div className="promo-content">
            <h2>Скидки до 30% на классику!</h2>
            <p>Только до конца месяца</p>
            <Link to="/sale" className="btn btn-white">Подробнее</Link>
          </div>
        </div>
      </section>

      <section className="books-section">
        <div className="container">
          <div className="section-header">
            <h2>Новинки</h2>
            <Link to="/catalog?sort=new" className="view-all">
              Смотреть все <ArrowRight size={16} />
            </Link>
          </div>
          <div className="books-grid">
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              newArrivals.map(book => (
                <BookCard key={book.id} book={book} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="books-section">
        <div className="container">
          <div className="section-header">
            <h2>Со скидкой</h2>
            <Link to="/sale" className="view-all">
              Смотреть все <ArrowRight size={16} />
            </Link>
          </div>
          <div className="books-grid">
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              discountedBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2>Популярные категории</h2>
          <div className="categories-grid">
            <Link to="/catalog?category=fiction" className="category-card">
              <img src="https://covers.openlibrary.org/b/isbn/9780143108276-L.jpg" alt="Художественная литература" />
              <span>Художественная литература</span>
            </Link>
            <Link to="/catalog?category=non-fiction" className="category-card">
              <img src="https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg" alt="Нехудожественная литература" />
              <span>Нехудожественная литература</span>
            </Link>
            <Link to="/catalog?category=children" className="category-card">
              <img src="https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg" alt="Детские книги" />
              <span>Детские книги</span>
            </Link>
            <Link to="/catalog?category=business" className="category-card">
              <img src="https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg" alt="Бизнес-литература" />
              <span>Бизнес-литература</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
