import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown } from 'lucide-react';
import Fuse from 'fuse.js';
import BookCard from '../../components/BookCard/BookCard';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import { api } from '../../services/api';
import { Book, Category } from '../../types';
import './Catalog.css';

const Catalog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [showFilters, setShowFilters] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const isSalePage = location.pathname === '/sale';

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
        const [booksResponse, categoriesData] = await Promise.all([
          isSalePage ? api.getDiscountedBooks() : api.getBooks({ category: categoryFilter, sort: sortBy }),
          api.getCategories(),
        ]);
        
        const booksData = Array.isArray(booksResponse) ? booksResponse : booksResponse.books || [];
        setBooks(booksData.map(mapBookFromApi));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryFilter, sortBy, isSalePage]);

  const fuse = useMemo(() => new Fuse(books, {
    keys: ['title', 'author'],
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
  }), [books]);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (searchQuery) {
      const searchResults = fuse.search(searchQuery);
      const matchedIds = searchResults.map(r => r.item.id);
      result = result.filter(book => matchedIds.includes(book.id));
      result.sort((a, b) => {
        const aIndex = matchedIds.indexOf(a.id);
        const bIndex = matchedIds.indexOf(b.id);
        return aIndex - bIndex;
      });
    }

    result = result.filter(
      book => book.price >= priceRange.min && book.price <= priceRange.max
    );

    if (!searchQuery) {
      switch (sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'new':
          result.sort((a, b) => b.year - a.year);
          break;
        default:
          break;
      }
    }

    return result;
  }, [books, searchQuery, sortBy, priceRange, fuse, isSalePage]);

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <h1>
            {isSalePage
              ? 'Акции и скидки'
              : searchQuery
              ? `Результаты поиска: "${searchQuery}"`
              : categoryFilter
              ? categories.find(c => c.slug === categoryFilter)?.name || 'Каталог'
              : 'Все книги'}
          </h1>
          <span className="results-count">Найдено: {filteredBooks.length}</span>
        </div>

        <div className="catalog-controls">
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Фильтры
            <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
          </button>

          <div className="catalog-sort">
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'popular', label: 'По популярности' },
                { value: 'new', label: 'Сначала новинки' },
                { value: 'price-asc', label: 'Сначала дешевые' },
                { value: 'price-desc', label: 'Сначала дорогие' },
                { value: 'rating', label: 'По рейтингу' },
              ]}
            />
          </div>

          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={20} />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        <div className={`catalog-filters ${showFilters ? 'open' : ''}`}>
          <div className="filter-section">
            <h3>Цена</h3>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="От"
                value={priceRange.min || ''}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: Number(e.target.value) })
                }
              />
              <span>—</span>
              <input
                type="number"
                placeholder="До"
                value={priceRange.max || ''}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: Number(e.target.value) })
                }
              />
              <span>р.</span>
            </div>
          </div>

          <div className="filter-section">
            <h3>Категории</h3>
            <ul className="filter-list">
              {categories.map(category => (
                <li key={category.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={categoryFilter === category.slug}
                      readOnly
                    />
                    <span>{category.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`catalog-grid ${viewMode}`}>
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map(book => <BookCard key={book.id} book={book} />)
          ) : (
            <div className="no-results">
              <p>По вашему запросу ничего не найдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
