# BookStore Backend

## Установка

1. Установите PostgreSQL
2. Создайте базу данных:
```sql
CREATE DATABASE bookstore;
```

3. Выполните SQL скрипты:
```bash
psql -U postgres -d bookstore -f ../database/schema.sql
psql -U postgres -d bookstore -f ../database/seed.sql
```

4. Создайте файл `.env`:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookstore
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

5. Установите зависимости:
```bash
npm install
```

6. Запустите сервер:
```bash
npm start
```

## API Endpoints

### Books
- GET /api/books - Список книг
- GET /api/books/:id - Книга по ID
- GET /api/books/bestsellers - Бестселлеры
- GET /api/books/new - Новинки
- GET /api/books/discounted - Со скидкой
- GET /api/books/search?q= - Поиск

### Categories
- GET /api/categories - Все категории
- GET /api/categories/:slug - Категория по slug

### Auth
- POST /api/auth/register - Регистрация
- POST /api/auth/login - Вход
- GET /api/auth/me - Текущий пользователь

### Cart
- GET /api/cart - Корзина
- POST /api/cart - Добавить в корзину
- PATCH /api/cart/:bookId - Обновить количество
- DELETE /api/cart/:bookId - Удалить из корзины
- DELETE /api/cart - Очистить корзину

### Favorites
- GET /api/favorites - Избранное
- POST /api/favorites/:bookId - Добавить
- DELETE /api/favorites/:bookId - Удалить

### Orders
- GET /api/orders - Заказы пользователя
- POST /api/orders - Создать заказ
- GET /api/orders/:id - Заказ по ID

### Stores
- GET /api/stores - Магазины

### Reviews
- GET /api/reviews/book/:bookId - Отзывы книги
- POST /api/reviews - Создать отзыв

