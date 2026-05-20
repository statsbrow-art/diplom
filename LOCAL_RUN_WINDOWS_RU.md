# Как запустить SPT Arena на Windows

## 1. Установить зависимости

Установи Node.js LTS и PostgreSQL. Распакуй архив, например в:

```text
C:\STM2\sports-ticket-manager
```

Открой `cmd` в этой папке:

```bat
cd C:\STM2\sports-ticket-manager
npm install --prefix server
npm install --prefix client
```

## 2. Создать PostgreSQL базу

В PostgreSQL выполни:

```sql
CREATE USER ticket WITH PASSWORD 'ticket';
ALTER USER ticket CREATEDB;
CREATE DATABASE ticketdb OWNER ticket;
GRANT ALL PRIVILEGES ON DATABASE ticketdb TO ticket;
\q
```

## 3. Создать server\.env

Создай файл:

```text
server\.env
```

Содержимое:

```env
DATABASE_URL="postgresql://ticket:ticket@localhost:5432/ticketdb?schema=public"
JWT_SECRET="local-dev-secret"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
BELARUS_EVENTS_IMPORT_ENABLED=true
```

## 4. Создать и заполнить SQL БД

```bat
npm run prisma:migrate --prefix server
npm run seed --prefix server
```

Команда `seed` заполняет базу пользователями, админом, спортом, площадками, секторами, мероприятиями, билетами, промокодами, заказами, занятыми местами, картой, листом ожидания и сообщениями поддержки.

## 5. Запуск сайта

Первый терминал:

```bat
cd C:\STM2\sports-ticket-manager
npm run dev --prefix server
```

Второй терминал:

```bat
cd C:\STM2\sports-ticket-manager
npm run dev --prefix client
```

Открыть:

```text
http://localhost:5173
```

Если frontend покажет другой порт, например `5174`, открывай именно его.

## Аккаунты после seed

```text
Админ: admin@demo.local / admin123
Пользователь: user@demo.local / user123
```

## Если PowerShell запрещает сценарии

Используй `cmd` или пиши `npm.cmd` вместо `npm`:

```bat
npm.cmd run dev --prefix client
npm.cmd run dev --prefix server
```
