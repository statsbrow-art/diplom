# BookStore - Интернет-магазин книг

Дипломный проект - интернет-магазин книг по типу oz.by

## Структура проекта

```
├── backend/          # Node.js + Express сервер
├── book-store/       # React фронтенд
└── database/         # SQL схема и данные
```

## Запуск проекта

### 1. Запуск бэкенда

```bash
cd backend
npm install
npm start
```

Сервер запустится на http://localhost:5000

### 2. Запуск фронтенда

```bash
cd book-store
npm install
npm start
```

Приложение откроется на http://localhost:3000

## API Эндпоинты

### Книги
- `GET /api/books` - список книг
- `GET /api/books/:id` - информация о книге
- `GET /api/books/bestsellers` - бестселлеры
- `GET /api/books/new` - новинки
- `GET /api/books/discounted` - книги со скидкой
- `GET /api/books/search?q=` - поиск книг

### Категории
- `GET /api/categories` - список категорий
- `GET /api/categories/:slug` - категория по slug

### Авторизация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/auth/me` - текущий пользователь

### Корзина (требует авторизации)
- `GET /api/cart` - получить корзину
- `POST /api/cart` - добавить в корзину
- `PATCH /api/cart/:bookId` - обновить количество
- `DELETE /api/cart/:bookId` - удалить из корзины

### Избранное (требует авторизации)
- `GET /api/favorites` - список избранного
- `POST /api/favorites/:bookId` - добавить в избранное
- `DELETE /api/favorites/:bookId` - удалить из избранного

### Заказы (требует авторизации)
- `GET /api/orders` - список заказов
- `POST /api/orders` - создать заказ

### Магазины
- `GET /api/stores` - список магазинов

## База данных

В папке `database/` находятся SQL файлы:

- `schema.sql` - схема базы данных (15 таблиц, триггеры, представления)
- `seed.sql` - тестовые данные

### Таблицы

1. `users` - пользователи
2. `authors` - авторы
3. `categories` - категории
4. `publishers` - издательства
5. `books` - книги
6. `reviews` - отзывы
7. `favorites` - избранное
8. `cart_items` - корзина
9. `orders` - заказы
10. `order_items` - позиции заказа
11. `stores` - магазины
12. `promo_codes` - промокоды
13. `user_addresses` - адреса пользователей
14. `activity_logs` - логи активности
15. `newsletter_subscribers` - подписки на рассылку

### Триггеры

- Автоматическое обновление `updated_at`
- Автоматический расчёт скидки
- Обновление рейтинга книги при добавлении отзыва
- Увеличение счётчика продаж
- Уменьшение остатка на складе
- Логирование создания заказов

### Представления (Views)

- `v_books_full` - книги с информацией об авторе и категории
- `v_bestsellers` - бестселлеры
- `v_new_arrivals` - новинки
- `v_discounted_books` - книги со скидкой
- `v_user_order_stats` - статистика заказов
- `v_popular_categories` - популярные категории
- `v_reviews_full` - отзывы с информацией
- `v_monthly_sales` - статистика продаж
- `v_active_promo_codes` - активные промокоды

## Функционал

- Каталог книг с фильтрацией и сортировкой
- Fuzzy поиск (находит похожие результаты даже с опечатками)
- Корзина покупок
- Избранное
- Регистрация и авторизация
- Оформление заказов
- Отслеживание статуса заказа
- Карта магазинов (Яндекс.Карты)
- Информационные страницы

## Технологии

### Frontend
- React 18
- TypeScript
- React Router
- Fuse.js (fuzzy search)
- Lucide React (иконки)

### Backend
- Node.js
- Express.js
- JWT (авторизация)
- bcryptjs (хеширование паролей)
- PostgreSQL (или mock данные)

## Подключение к PostgreSQL

1. Создайте базу данных
2. Выполните `database/schema.sql`
3. Выполните `database/seed.sql`
4. Создайте `backend/.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookstore
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

Без PostgreSQL бэкенд работает с mock данными.

