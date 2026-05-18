-- 1. Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Таблица авторов
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Таблица категорий
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- 4. Таблица книг
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author_id INTEGER REFERENCES authors(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    old_price DECIMAL(10, 2),
    discount INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    year INTEGER,
    rating DECIMAL(2, 1) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Таблица отзывов
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Таблица избранного
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- 7. Таблица корзины
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- 8. Таблица заказов
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    delivery_price DECIMAL(10, 2) DEFAULT 0,
    delivery_method VARCHAR(50),
    delivery_city VARCHAR(100),
    delivery_address TEXT,
    delivery_phone VARCHAR(20),
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Таблица позиций заказа
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Таблица магазинов
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    working_hours VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Таблица промокодов
CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER,
    discount_amount DECIMAL(10, 2),
    min_order_amount DECIMAL(10, 2),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Таблица адресов пользователей
CREATE TABLE user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    building VARCHAR(20),
    apartment VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Таблица способов оплаты
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'card',
    card_number VARCHAR(20),
    card_holder VARCHAR(255),
    expiry_date VARCHAR(10),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ИНДЕКСЫ
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_books_price ON books(price);
CREATE INDEX idx_books_rating ON books(rating);
CREATE INDEX idx_books_sales ON books(sales_count);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_reviews_book ON reviews(book_id);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ТРИГГЕРЫ

-- Триггер для обновления updated_at в таблице orders
CREATE OR REPLACE FUNCTION update_order_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_timestamp
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_timestamp();

-- Триггер для автоматического расчета скидки
CREATE OR REPLACE FUNCTION calculate_book_discount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.old_price IS NOT NULL AND NEW.old_price > NEW.price THEN
        NEW.discount = ROUND(((NEW.old_price - NEW.price) / NEW.old_price * 100)::numeric);
    ELSE
        NEW.discount = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_discount
    BEFORE INSERT OR UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION calculate_book_discount();

-- Триггер для обновления рейтинга книги при добавлении отзыва
CREATE OR REPLACE FUNCTION update_book_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM reviews
        WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
        AND is_approved = true
    )
    WHERE id = COALESCE(NEW.book_id, OLD.book_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_book_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_book_rating();

-- Триггер для увеличения счетчика продаж при создании заказа
CREATE OR REPLACE FUNCTION update_sales_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET sales_count = sales_count + NEW.quantity
    WHERE id = NEW.book_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sales_count
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_count();

-- Триггер для уменьшения остатка на складе при создании заказа
CREATE OR REPLACE FUNCTION decrease_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET stock = stock - NEW.quantity
    WHERE id = NEW.book_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrease_stock
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION decrease_stock();

-- ПРЕДСТАВЛЕНИЯ (VIEWS)

-- Представление книг с информацией об авторе и категории
CREATE OR REPLACE VIEW v_books_full AS
SELECT 
    b.id,
    b.title,
    a.name AS author_name,
    c.name AS category_name,
    c.slug AS category_slug,
    b.price,
    b.old_price,
    b.discount,
    b.image_url,
    b.year,
    b.rating,
    b.stock,
    b.sales_count,
    b.created_at
FROM books b
LEFT JOIN authors a ON b.author_id = a.id
LEFT JOIN categories c ON b.category_id = c.id;

-- Представление бестселлеров
CREATE OR REPLACE VIEW v_bestsellers AS
SELECT * FROM v_books_full
ORDER BY sales_count DESC
LIMIT 20;

-- Представление новинок
CREATE OR REPLACE VIEW v_new_arrivals AS
SELECT * FROM v_books_full
ORDER BY created_at DESC
LIMIT 20;

-- Представление книг со скидкой
CREATE OR REPLACE VIEW v_discounted_books AS
SELECT * FROM v_books_full
WHERE discount > 0
ORDER BY discount DESC;

-- Представление статистики заказов по пользователям
CREATE OR REPLACE VIEW v_user_order_stats AS
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_price), 0) AS total_spent,
    MAX(o.created_at) AS last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email;

-- Представление отзывов с информацией о пользователе и книге
CREATE OR REPLACE VIEW v_reviews_full AS
SELECT 
    r.id,
    r.rating,
    r.comment,
    r.created_at,
    r.is_approved,
    u.name AS user_name,
    b.title AS book_title,
    b.id AS book_id
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN books b ON r.book_id = b.id;

-- Представление статистики продаж по месяцам
CREATE OR REPLACE VIEW v_monthly_sales AS
SELECT 
    DATE_TRUNC('month', o.created_at) AS month,
    COUNT(o.id) AS orders_count,
    SUM(o.total_price) AS total_revenue,
    AVG(o.total_price) AS avg_order_value
FROM orders o
WHERE o.status NOT IN ('cancelled')
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;

-- Представление активных промокодов
CREATE OR REPLACE VIEW v_active_promo_codes AS
SELECT *
FROM promo_codes
WHERE is_active = true
AND (valid_from IS NULL OR valid_from <= CURRENT_TIMESTAMP)
AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP)
AND (max_uses IS NULL OR current_uses < max_uses);
