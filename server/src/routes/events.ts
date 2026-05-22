import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError } from '../middleware/error.js';
import { getBelarusEventsPreview } from '../services/belarusEvents.js';
import { getCisSportsEventsPreview } from '../services/cisSportsEvents.js';

const router = Router();

const listQuerySchema = z.object({
  sportId: z.string().optional(),
  city: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
});

router.get('/featured/summary', async (_req, res, next) => {
  try {
    const [eventsCount, sportsCount, venuesCount, cities] = await Promise.all([
      prisma.event.count({ where: { status: { in: ['ON_SALE', 'SCHEDULED'] } } }),
      prisma.sport.count(),
      prisma.venue.count(),
      prisma.venue.findMany({
        select: { city: true },
        distinct: ['city'],
      }),
    ]);
    const nextEvents = await prisma.event.findMany({
      take: 3,
      where: { status: { in: ['ON_SALE', 'SCHEDULED'] } },
      include: {
        sport: true,
        venue: true,
        ticketTypes: { select: { price: true } },
      },
      orderBy: { startsAt: 'asc' },
    });
    const popularItems = await prisma.orderItem.groupBy({
      by: ['ticketTypeId'],
      _count: true,
      orderBy: { _count: { ticketTypeId: 'desc' } },
      take: 9,
    });
    const popularTicketTypes = await prisma.ticketType.findMany({
      where: { id: { in: popularItems.map((item) => item.ticketTypeId) } },
      include: {
        event: {
          include: {
            sport: true,
            venue: true,
            ticketTypes: { select: { price: true } },
          },
        },
      },
    });
    const popularMap = new Map(popularTicketTypes.map((item) => [item.id, item.event]));
    const popularEvents = popularItems
      .map((item) => popularMap.get(item.ticketTypeId))
      .filter((event): event is NonNullable<typeof event> => Boolean(event))
      .filter((event, index, events) => events.findIndex((item) => item.id === event.id) === index)
      .slice(0, 3);
    const budgetEvents = await prisma.event.findMany({
      take: 3,
      where: {
        status: { in: ['ON_SALE', 'SCHEDULED'] },
        ticketTypes: { some: { price: { lte: 35 } } },
      },
      include: { sport: true, venue: true, ticketTypes: { select: { price: true } } },
      orderBy: { startsAt: 'asc' },
    });
    const weekendEnd = new Date();
    weekendEnd.setDate(weekendEnd.getDate() + 7);
    const weekendEvents = await prisma.event.findMany({
      take: 3,
      where: {
        status: { in: ['ON_SALE', 'SCHEDULED'] },
        startsAt: { lte: weekendEnd },
      },
      include: { sport: true, venue: true, ticketTypes: { select: { price: true } } },
      orderBy: { startsAt: 'asc' },
    });
    const normalizeEvent = (e: (typeof nextEvents)[number]) => ({
      ...e,
      minPrice:
        e.ticketTypes.length > 0
          ? Math.min(...e.ticketTypes.map((t) => Number(t.price)))
          : null,
      ticketTypes: undefined,
    });

    res.json({
      stats: {
        eventsCount,
        sportsCount,
        venuesCount,
        citiesCount: cities.length,
      },
      nextEvents: nextEvents.map(normalizeEvent),
      collections: {
        popular: popularEvents.map(normalizeEvent),
        budget: budgetEvents.map(normalizeEvent),
        weekend: weekendEvents.map(normalizeEvent),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/venues/list', async (_req, res, next) => {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: [{ city: 'asc' }, { name: 'asc' }],
      include: {
        sectors: true,
        events: {
          where: { status: { in: ['ON_SALE', 'SCHEDULED'] } },
          orderBy: { startsAt: 'asc' },
          take: 4,
          include: { sport: true },
        },
      },
    });
    res.json({ venues });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const q = listQuerySchema.parse(req.query);
    const events = await prisma.event.findMany({
      where: {
        sportId: q.sportId,
        venue: q.city ? { city: { equals: q.city, mode: 'insensitive' } } : undefined,
        startsAt: {
          gte: q.from ? new Date(q.from) : undefined,
          lte: q.to ? new Date(q.to) : undefined,
        },
        title: q.q ? { contains: q.q, mode: 'insensitive' } : undefined,
        status: { in: ['ON_SALE', 'SCHEDULED'] },
      },
      include: {
        sport: true,
        venue: true,
        ticketTypes: { select: { price: true } },
      },
      orderBy: { startsAt: 'asc' },
    });
    res.json({
      events: events.map((e) => ({
        ...e,
        minPrice:
          e.ticketTypes.length > 0
            ? Math.min(...e.ticketTypes.map((t) => Number(t.price)))
            : null,
        ticketTypes: undefined,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/sports', async (_req, res, next) => {
  try {
    const sports = await prisma.sport.findMany({ orderBy: { name: 'asc' } });
    res.json({ sports });
  } catch (err) {
    next(err);
  }
});

router.get('/cities', async (_req, res, next) => {
  try {
    const venues = await prisma.venue.findMany({
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });
    res.json({ cities: venues.map((v) => v.city) });
  } catch (err) {
    next(err);
  }
});

router.get('/belarus/preview', async (_req, res, next) => {
  try {
    const events = await getBelarusEventsPreview();
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

router.get('/cis/preview', async (_req, res, next) => {
  try {
    const events = await getCisSportsEventsPreview();
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        sport: true,
        venue: { include: { sectors: true } },
        ticketTypes: { include: { sector: true } },
      },
    });
    if (!event) throw new HttpError(404, 'Event not found');

    const orderItems = await prisma.orderItem.findMany({
      where: {
        ticketType: { eventId: event.id },
        order: { status: { in: ['PENDING', 'PAID'] } },
      },
      select: { ticketTypeId: true, seatRow: true, seatNumber: true },
    });
    const taken: Record<string, Array<{ row: number; number: number }>> = {};
    for (const item of orderItems) {
      const key = item.ticketTypeId;
      taken[key] ??= [];
      taken[key].push({ row: item.seatRow, number: item.seatNumber });
    }
    res.json({ event, taken });
  } catch (err) {
    next(err);
  }
});

export default router;
