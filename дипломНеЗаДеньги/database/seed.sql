-- Добавление авторов
INSERT INTO authors (name) VALUES
('Джеймс Клир'),
('Джон Стрелеки'),
('Михаил Булгаков'),
('Джордж Оруэлл'),
('Дж. К. Роулинг'),
('Даниэль Канеман'),
('Фёдор Достоевский'),
('Лев Толстой'),
('Антуан де Сент-Экзюпери'),
('Юваль Ной Харари'),
('Джером Сэлинджер'),
('Дж. Р. Р. Толкин'),
('Стивен Кинг'),
('Харуки Мураками'),
('Эрих Мария Ремарк');

-- Добавление категорий
INSERT INTO categories (name, slug) VALUES
('Художественная литература', 'fiction'),
('Нехудожественная литература', 'non-fiction'),
('Детские книги', 'children'),
('Бизнес-литература', 'business'),
('Комиксы и манга', 'comics'),
('Учебная литература', 'education');

-- Добавление книг
INSERT INTO books (title, author_id, category_id, price, old_price, image_url, year, rating, stock, sales_count) VALUES
('Атомные привычки', 1, 2, 17.85, 21.50, 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', 2024, 4.8, 50, 150),
('Кафе на краю земли', 2, 1, 10.50, 13.12, 'https://covers.openlibrary.org/b/isbn/9780991392445-L.jpg', 2018, 4.6, 35, 120),
('Мастер и Маргарита', 3, 1, 15.00, NULL, 'https://covers.openlibrary.org/b/isbn/9780143108276-L.jpg', 2023, 4.9, 100, 200),
('1984', 4, 1, 12.30, 14.50, 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 2024, 4.7, 80, 180),
('Гарри Поттер и философский камень', 5, 3, 22.00, 27.50, 'https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg', 2024, 4.9, 60, 250),
('Думай медленно... решай быстро', 6, 2, 19.90, NULL, 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg', 2023, 4.5, 40, 90),
('Преступление и наказание', 7, 1, 11.50, NULL, 'https://covers.openlibrary.org/b/isbn/9780486415871-L.jpg', 2023, 4.8, 90, 130),
('Война и мир', 8, 1, 25.00, 30.00, 'https://covers.openlibrary.org/b/isbn/9781400079988-L.jpg', 2024, 4.9, 45, 110),
('Маленький принц', 9, 3, 8.50, NULL, 'https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg', 2023, 4.9, 120, 300),
('Sapiens. Краткая история человечества', 10, 2, 23.00, 28.00, 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg', 2024, 4.7, 55, 140),
('Над пропастью во ржи', 11, 1, 9.80, NULL, 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg', 2023, 4.4, 70, 85),
('Хоббит', 12, 1, 18.50, 22.00, 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg', 2024, 4.8, 65, 160),
('Оно', 13, 1, 28.00, 32.00, 'https://covers.openlibrary.org/b/isbn/9781501142970-L.jpg', 2023, 4.6, 30, 95),
('Норвежский лес', 14, 1, 14.50, NULL, 'https://covers.openlibrary.org/b/isbn/9780375704024-L.jpg', 2024, 4.5, 40, 75),
('Три товарища', 15, 1, 13.20, 15.50, 'https://covers.openlibrary.org/b/isbn/9780449912423-L.jpg', 2023, 4.8, 55, 125);

-- Добавление пользователей (пароль для всех: admin123)
INSERT INTO users (email, password_hash, name, phone, role) VALUES
('admin@bookstore.by', '$2a$10$7FKi.Wn7PUXRhPiXMkEXCeMc3YIFOmUA0oQjoUVMUsfhU6l7NCh66', 'Администратор', '+375291234567', 'admin'),
('user@example.com', '$2a$10$7FKi.Wn7PUXRhPiXMkEXCeMc3YIFOmUA0oQjoUVMUsfhU6l7NCh66', 'Иван Петров', '+375291111111', 'customer'),
('maria@example.com', '$2a$10$7FKi.Wn7PUXRhPiXMkEXCeMc3YIFOmUA0oQjoUVMUsfhU6l7NCh66', 'Мария Сидорова', '+375292222222', 'customer');

-- Добавление магазинов
INSERT INTO stores (name, city, address, phone, working_hours, latitude, longitude) VALUES
('BookStore ТЦ "Галерея"', 'Минск', 'пр-т Победителей, 9', '+375 (29) 123-45-01', '10:00 - 22:00', 53.9086, 27.5499),
('BookStore ТЦ "Дана Молл"', 'Минск', 'пр-т Победителей, 65', '+375 (29) 123-45-02', '10:00 - 22:00', 53.9344, 27.4879),
('BookStore ТЦ "Замок"', 'Минск', 'пр-т Победителей, 65, корп. 1', '+375 (29) 123-45-03', '10:00 - 21:00', 53.9351, 27.4889),
('BookStore ТЦ "Столица"', 'Минск', 'пр-т Независимости, 3-2', '+375 (29) 123-45-04', '10:00 - 22:00', 53.8964, 27.5489),
('BookStore ТРЦ "Galleria Minsk"', 'Минск', 'пр-т Победителей, 9', '+375 (29) 123-45-05', '10:00 - 22:00', 53.9075, 27.5519),
('BookStore ТЦ "Арена Сити"', 'Минск', 'пр-т Победителей, 84', '+375 (29) 123-45-06', '10:00 - 22:00', 53.9315, 27.4769),
('BookStore ТЦ "Европа"', 'Минск', 'ул. Сурганова, 57Б', '+375 (29) 123-45-07', '10:00 - 21:00', 53.9195, 27.5879),
('BookStore ТЦ "Корона"', 'Минск', 'ул. Кальварийская, 24', '+375 (29) 123-45-08', '09:00 - 23:00', 53.8938, 27.5266);

-- Добавление отзывов
INSERT INTO reviews (book_id, user_id, rating, comment, is_approved) VALUES
(1, 2, 5, 'Отличная книга! Помогла изменить мои привычки.', true),
(1, 3, 4, 'Много полезных советов, рекомендую.', true),
(3, 2, 5, 'Классика! Перечитываю уже третий раз.', true),
(5, 3, 5, 'Волшебная книга для детей и взрослых!', true),
(9, 2, 5, 'Философская притча, которую должен прочитать каждый.', true);

-- Добавление промокодов
INSERT INTO promo_codes (code, discount_percent, min_order_amount, max_uses, valid_until) VALUES
('WELCOME10', 10, 20.00, 100, '2026-12-31 23:59:59'),
('SUMMER20', 20, 50.00, 50, '2026-08-31 23:59:59'),
('BOOK15', 15, 30.00, NULL, '2026-06-30 23:59:59');

-- Добавление избранного
INSERT INTO favorites (user_id, book_id) VALUES
(2, 1), (2, 3), (2, 5),
(3, 2), (3, 9);

-- Добавление адресов пользователей
INSERT INTO user_addresses (user_id, city, street, building, apartment, is_default) VALUES
(2, 'Минск', 'пр-т Независимости', '100', '25', true),
(3, 'Минск', 'ул. Немига', '5', '10', true);

-- Добавление тестовых заказов
INSERT INTO orders (order_number, user_id, total_price, delivery_price, delivery_method, delivery_city, delivery_address, delivery_phone, payment_method, status) VALUES
('ORD-001', 2, 45.35, 5.00, 'courier', 'Минск', 'пр-т Независимости, 100, кв. 25', '+375291111111', 'card', 'delivered'),
('ORD-002', 3, 22.50, 0.00, 'pickup', 'Минск', 'ТЦ "Галерея", пр-т Победителей, 9', '+375292222222', 'cash', 'processing');

-- Добавление позиций заказов
INSERT INTO order_items (order_id, book_id, quantity, price) VALUES
(1, 1, 1, 17.85),
(1, 4, 2, 12.30),
(2, 9, 2, 8.50),
(2, 11, 1, 9.80);
