import { PrismaClient, Role, EventStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { importBelarusEvents } from '../src/services/belarusEvents.js';
import { importCisSportsEvents } from '../src/services/cisSportsEvents.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: {
      passwordHash: adminHash,
      name: 'Администратор SPT Arena',
      role: Role.ADMIN,
      blocked: false,
    },
    create: {
      email: 'admin@demo.local',
      passwordHash: adminHash,
      name: 'Администратор SPT Arena',
      role: Role.ADMIN,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'SPT10' },
    update: { percentOff: 10, active: true, description: 'Скидка 10% на первый заказ' },
    create: {
      code: 'SPT10',
      description: 'Скидка 10% на первый заказ',
      percentOff: 10,
      active: true,
    },
  });
  await prisma.promoCode.upsert({
    where: { code: 'ARENA20' },
    update: { percentOff: 20, active: true, description: 'Arena promo discount' },
    create: {
      code: 'ARENA20',
      description: 'Arena promo discount',
      percentOff: 20,
      active: true,
    },
  });
  const user = await prisma.user.upsert({
    where: { email: 'user@demo.local' },
    update: {
      passwordHash: userHash,
      name: 'Даниил Папков',
      role: Role.USER,
      blocked: false,
    },
    create: {
      email: 'user@demo.local',
      passwordHash: userHash,
      name: 'Даниил Папков',
      role: Role.USER,
    },
  });

  // Sports
  const sportData = [
    { name: 'Футбол', icon: '⚽' },
    { name: 'Баскетбол', icon: '🏀' },
    { name: 'Хоккей', icon: '🏒' },
    { name: 'Теннис', icon: '🎾' },
    { name: 'Волейбол', icon: '🏐' },
  ];
  const sports: Record<string, string> = {};
  for (const s of sportData) {
    const sport = await prisma.sport.upsert({
      where: { name: s.name },
      update: { icon: s.icon },
      create: s,
    });
    sports[s.name] = sport.id;
  }

  // Venues + sectors
  const venuesData = [
    {
      name: 'Национальный олимпийский стадион Динамо',
      city: 'Минск',
      address: 'ул. Кирова, 8',
      sectors: [
        { name: 'VIP', rows: 4, seatsPerRow: 10 },
        { name: 'Трибуна A', rows: 8, seatsPerRow: 14 },
        { name: 'Трибуна B', rows: 8, seatsPerRow: 14 },
      ],
    },
    {
      name: 'Минск-Арена',
      city: 'Минск',
      address: 'пр. Победителей, 111',
      sectors: [
        { name: 'VIP', rows: 3, seatsPerRow: 12 },
        { name: 'Северная трибуна', rows: 10, seatsPerRow: 16 },
        { name: 'Южная трибуна', rows: 10, seatsPerRow: 16 },
      ],
    },
    {
      name: 'Дворец спорта',
      city: 'Минск',
      address: 'пр. Победителей, 4',
      sectors: [
        { name: 'Центр', rows: 6, seatsPerRow: 12 },
        { name: 'Боковая трибуна', rows: 8, seatsPerRow: 14 },
      ],
    },
  ];

  const venueIds: Record<string, string> = {};
  const sectorIdsByVenue: Record<string, Record<string, string>> = {};

  for (const v of venuesData) {
    let venue = await prisma.venue.findFirst({ where: { name: v.name } });
    venue ??= await prisma.venue.create({
      data: { name: v.name, city: v.city, address: v.address },
    });
    venueIds[v.name] = venue.id;
    sectorIdsByVenue[v.name] = {};

    for (const sec of v.sectors) {
      const sector = await prisma.sector.upsert({
        where: { venueId_name: { venueId: venue.id, name: sec.name } },
        update: { rows: sec.rows, seatsPerRow: sec.seatsPerRow },
        create: {
          venueId: venue.id,
          name: sec.name,
          rows: sec.rows,
          seatsPerRow: sec.seatsPerRow,
        },
      });
      sectorIdsByVenue[v.name][sec.name] = sector.id;
    }
  }

  // Events
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const events = [
    {
      title: 'Динамо-Минск — БАТЭ',
      description: 'Матч чемпионата Беларуси по футболу',
      sport: 'Футбол',
      venue: 'Национальный олимпийский стадион Динамо',
      startsAt: new Date(now + 7 * day),
      prices: { VIP: 90, 'Трибуна A': 35, 'Трибуна B': 28 },
    },
    {
      title: 'Динамо-Минск — Шахтёр',
      description: 'Ключевой матч футбольного сезона',
      sport: 'Футбол',
      venue: 'Национальный олимпийский стадион Динамо',
      startsAt: new Date(now + 10 * day),
      prices: { VIP: 100, 'Трибуна A': 40, 'Трибуна B': 32 },
    },
    {
      title: 'Цмоки-Минск — Гродно-93',
      description: 'Матч чемпионата Беларуси по баскетболу',
      sport: 'Баскетбол',
      venue: 'Дворец спорта',
      startsAt: new Date(now + 4 * day),
      prices: { Центр: 30, 'Боковая трибуна': 16 },
    },
    {
      title: 'Динамо-Минск — Юность',
      description: 'Минское хоккейное дерби',
      sport: 'Хоккей',
      venue: 'Минск-Арена',
      startsAt: new Date(now + 14 * day),
      prices: { VIP: 80, 'Северная трибуна': 24, 'Южная трибуна': 22 },
    },
  ];

  for (const e of events) {
    const existing = await prisma.event.findFirst({
      where: { title: e.title },
    });
    const event = existing
      ? await prisma.event.update({
          where: { id: existing.id },
          data: {
            description: e.description,
            sportId: sports[e.sport],
            venueId: venueIds[e.venue],
            startsAt: e.startsAt,
            status: EventStatus.ON_SALE,
          },
        })
      : await prisma.event.create({
          data: {
            title: e.title,
            description: e.description,
            sportId: sports[e.sport],
            venueId: venueIds[e.venue],
            startsAt: e.startsAt,
            status: EventStatus.ON_SALE,
          },
        });

    for (const [sectorName, price] of Object.entries(e.prices)) {
      const sectorId = sectorIdsByVenue[e.venue][sectorName];
      await prisma.ticketType.upsert({
        where: {
          eventId_sectorId_name: {
            eventId: event.id,
            sectorId,
            name: sectorName,
          },
        },
        update: { price },
        create: {
          eventId: event.id,
          sectorId,
          name: sectorName,
          price,
        },
      });
    }
  }

  await importBelarusEvents();
  await importCisSportsEvents();

  const firstEvent = await prisma.event.findFirst({
    where: { status: EventStatus.ON_SALE },
    orderBy: { startsAt: 'asc' },
    include: { ticketTypes: { include: { sector: true }, orderBy: { price: 'asc' } } },
  });

  if (firstEvent?.ticketTypes[0]) {
    const ticketType = firstEvent.ticketTypes[0];
    const existingOrder = await prisma.order.findFirst({
      where: { userId: user.id, items: { some: { ticketTypeId: ticketType.id } } },
    });
    if (!existingOrder) {
      const timestamp = Date.now();
      await prisma.order.create({
        data: {
          userId: user.id,
          total: Number(ticketType.price) * 2,
          discount: 0,
          status: OrderStatus.PAID,
          payment: {
            create: {
              amount: Number(ticketType.price) * 2,
              discount: 0,
              cardBrand: 'Visa',
              cardLast4: '4242',
              status: PaymentStatus.PAID,
            },
          },
          items: {
            create: [
              {
                ticketTypeId: ticketType.id,
                seatRow: 1,
                seatNumber: 1,
                price: ticketType.price,
                ticketCode: `SPT-${timestamp}-01`,
              },
              {
                ticketTypeId: ticketType.id,
                seatRow: 1,
                seatNumber: 2,
                price: ticketType.price,
                ticketCode: `SPT-${timestamp}-02`,
              },
            ],
          },
        },
      });
    }
  }

  await prisma.paymentCard.upsert({
    where: { id: 'seed-card-user-visa' },
    update: {
      holder: user.name,
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2028,
    },
    create: {
      id: 'seed-card-user-visa',
      userId: user.id,
      holder: user.name,
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2028,
    },
  });

  if (firstEvent) {
    await prisma.waitlistSubscription.upsert({
      where: { userId_eventId: { userId: user.id, eventId: firstEvent.id } },
      update: { active: true, notifyBy: 'email' },
      create: { userId: user.id, eventId: firstEvent.id, notifyBy: 'email', active: true },
    });
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { role: Role.ADMIN, blocked: false },
  });

  console.log('Seed complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
