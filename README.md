# Sports Ticket Manager

Веб-менеджер билетов на спортивные события с PostgreSQL-базой данных, выбором мест, QR-билетами и админ-панелью.
Sports ticket manager with PostgreSQL, seat selection, QR tickets and admin panel.

## Stack
- **Frontend:** React 19 + Vite + TypeScript + React Router + TailwindCSS + i18next (RU/EN)
- **Backend:** Node.js + Express + TypeScript + Prisma ORM + JWT
- **Database:** PostgreSQL
- **Events data:** PostgreSQL seed data + optional external imports

## Project layout
```
.
├── server/   # Express API + Prisma + Postgres
└── client/   # React + Vite single-page app
```

## Quick start

### 1. Database
Install PostgreSQL and create a database:
```bash
sudo -u postgres psql -c "CREATE USER ticket WITH PASSWORD 'ticket' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE ticketdb OWNER ticket;"
```

### 2. Backend
```bash
cd server
cp .env.example .env
npm install
npm run prisma:migrate     # creates tables
npm run seed               # fills SQL database with users, events, venues, cards, orders and support data
npm run dev                # http://localhost:4000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev                # http://localhost:5173
```

## Seed accounts
| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@demo.local   | admin123  |
| User  | user@demo.local    | user123   |

## Features

### User
- Register / Login (JWT)
- Browse events with filters (sport, city, date)
- SQL-backed catalog with BYN prices, venues and sports
- Event page with sector picker and seat selection
- Cart and checkout (simulated payment)
- Profile with order history and tickets (unique ticket codes)

### Admin
- Sales dashboard
- CRUD for sports, venues, sectors, events, ticket types
- Import and select external CIS sports events
- User management (role, block/unblock)
- View all orders

### Localization
- RU and EN — switcher in the header

## Optional external events format

Set `BELARUS_EVENTS_API_URL` to a JSON endpoint returning either an array or `{ "events": [...] }`.
The importer accepts common field names such as:

```json
{
  "id": "event-1",
  "title": "Динамо-Минск — Неман",
  "description": "Хоккейный матч",
  "sport": "Хоккей",
  "venueName": "Минск-Арена",
  "city": "Минск",
  "address": "пр. Победителей, 111",
  "startsAt": "2026-02-21T19:10:00+03:00",
  "price": 18,
  "url": "https://example.by/events/event-1"
}
```

If no endpoint is configured, the seed command uses the built-in project dataset and stores it in PostgreSQL.
