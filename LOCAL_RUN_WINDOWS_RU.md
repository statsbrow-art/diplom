# Локальный запуск SPT Arena на Windows

Проект состоит из трёх частей:

- `client` — сайт React/Vite;
- `server` — backend API Express;
- PostgreSQL — SQL база данных с пользователями, заказами, билетами, картами, площадками и событиями.

## 1. Запуск базы данных (локальный PostgreSQL)

Установи PostgreSQL (версия 14+) и создай пользователя и базу:

```sql
CREATE USER ticket WITH PASSWORD 'ticket' SUPERUSER;
CREATE DATABASE ticketdb OWNER ticket;
```

Убедись, что PostgreSQL запущен и доступен по адресу `localhost:5432`.

Строка подключения:

```text
postgresql://ticket:ticket@localhost:5432/ticketdb?schema=public
```

## 2. Backend

Открой терминал в корне проекта:

```bat
cd C:\STM2\sports-ticket-manager
npm install --prefix server
copy server\.env.example server\.env
npm run prisma:migrate --prefix server
npm run seed --prefix server
npm run dev --prefix server
```

Backend будет работать на:

```text
http://localhost:4000
```

## 3. Frontend

Открой второй терминал:

```bat
cd C:\STM2\sports-ticket-manager
npm install --prefix client
npm run dev --prefix client
```

Сайт будет работать на:

```text
http://localhost:5173
```

## 4. Cloudflare Tunnel

Базу данных через tunnel открывать не нужно. PostgreSQL остаётся локально на компьютере, backend подключается к ней через `DATABASE_URL`, а наружу через Cloudflare Tunnel отдаётся сайт вместе с API.

Самый простой вариант — открыть tunnel на frontend Vite:

```bat
cloudflared tunnel --url http://localhost:5173
```

Vite проксирует запросы `/api` на backend `http://localhost:4000`, поэтому по публичной ссылке Cloudflare будут работать и сайт, и API.

Если делаешь отдельный tunnel на backend, добавь публичный URL сайта в `server\.env` в `CORS_ORIGIN`, например:

```env
CORS_ORIGIN="http://localhost:5173,https://your-site.trycloudflare.com"
```

После изменения `.env` backend нужно перезапустить.

## 5. Демо-аккаунты

| Роль | Email | Пароль |
|---|---|---|
| Админ | `admin@demo.local` | `admin123` |
| Пользователь | `user@demo.local` | `user123` |

## 6. Если PowerShell запрещает сценарии

Используй `cmd` или пиши `npm.cmd` вместо `npm`:

```bat
npm.cmd run dev --prefix client
npm.cmd run dev --prefix server
```
