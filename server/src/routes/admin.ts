import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate, requireAdmin, hashPassword } from '../auth.js';
import { importBelarusEvents } from '../services/belarusEvents.js';
import {
  getCisSportsEventsPreview,
  importCisSportsEvents,
  importSelectedCisSportsEvents,
} from '../services/cisSportsEvents.js';

const router = Router();
router.use(authenticate, requireAdmin);

// ----- Stats -----
router.get('/stats', async (_req, res, next) => {
  try {
    const [usersCount, eventsCount, ordersAgg, recentOrders, topEvents] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, name: true } },
          items: { select: { id: true } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ['ticketTypeId'],
        _count: true,
        orderBy: { _count: { ticketTypeId: 'desc' } },
        take: 5,
      }),
    ]);

    const ttIds = topEvents.map((t) => t.ticketTypeId);
    const ticketTypes = await prisma.ticketType.findMany({
      where: { id: { in: ttIds } },
      include: { event: { select: { id: true, title: true } } },
    });
    const ttMap = new Map(ticketTypes.map((t) => [t.id, t]));
    const eventCounts: Record<string, { id: string; title: string; sold: number }> = {};
    for (const t of topEvents) {
      const tt = ttMap.get(t.ticketTypeId);
      if (!tt) continue;
      const e = eventCounts[tt.event.id] ?? { id: tt.event.id, title: tt.event.title, sold: 0 };
      e.sold += t._count;
      eventCounts[tt.event.id] = e;
    }

    res.json({
      usersCount,
      eventsCount,
      revenue: Number(ordersAgg._sum.total ?? 0),
      paidOrdersCount: ordersAgg._count,
      recentOrders,
      topEvents: Object.values(eventCounts).sort((a, b) => b.sold - a.sold),
    });
  } catch (err) {
    next(err);
  }
});

// ----- Sports -----
const sportSchema = z.object({ name: z.string().min(1), icon: z.string().optional().nullable() });
router.get('/sports', async (_req, res, next) => {
  try {
    res.json({ sports: await prisma.sport.findMany({ orderBy: { name: 'asc' } }) });
  } catch (err) {
    next(err);
  }
});
router.post('/sports', async (req, res, next) => {
  try {
    const data = sportSchema.parse(req.body);
    res.status(201).json({ sport: await prisma.sport.create({ data }) });
  } catch (err) {
    next(err);
  }
});
router.put('/sports/:id', async (req, res, next) => {
  try {
    const data = sportSchema.parse(req.body);
    res.json({ sport: await prisma.sport.update({ where: { id: req.params.id }, data }) });
  } catch (err) {
    next(err);
  }
});
router.delete('/sports/:id', async (req, res, next) => {
  try {
    await prisma.sport.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ----- Venues -----
const venueSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
});
router.get('/venues', async (_req, res, next) => {
  try {
    res.json({
      venues: await prisma.venue.findMany({
        orderBy: { name: 'asc' },
        include: { sectors: true },
      }),
    });
  } catch (err) {
    next(err);
  }
});
router.post('/venues', async (req, res, next) => {
  try {
    const data = venueSchema.parse(req.body);
    res.status(201).json({ venue: await prisma.venue.create({ data }) });
  } catch (err) {
    next(err);
  }
});
router.put('/venues/:id', async (req, res, next) => {
  try {
    const data = venueSchema.parse(req.body);
    res.json({ venue: await prisma.venue.update({ where: { id: req.params.id }, data }) });
  } catch (err) {
    next(err);
  }
});
router.delete('/venues/:id', async (req, res, next) => {
  try {
    await prisma.venue.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ----- Sectors -----
const sectorSchema = z.object({
  venueId: z.string(),
  name: z.string().min(1),
  rows: z.number().int().min(1).max(200),
  seatsPerRow: z.number().int().min(1).max(200),
});
router.post('/sectors', async (req, res, next) => {
  try {
    const data = sectorSchema.parse(req.body);
    res.status(201).json({ sector: await prisma.sector.create({ data }) });
  } catch (err) {
    next(err);
  }
});
router.put('/sectors/:id', async (req, res, next) => {
  try {
    const data = sectorSchema.partial().parse(req.body);
    res.json({ sector: await prisma.sector.update({ where: { id: req.params.id }, data }) });
  } catch (err) {
    next(err);
  }
});
router.delete('/sectors/:id', async (req, res, next) => {
  try {
    await prisma.sector.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ----- Events -----
const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  sportId: z.string(),
  venueId: z.string(),
  startsAt: z.string(),
  status: z.enum(['SCHEDULED', 'ON_SALE', 'CANCELLED', 'FINISHED']).optional(),
});
router.get('/events', async (_req, res, next) => {
  try {
    res.json({
      events: await prisma.event.findMany({
        orderBy: { startsAt: 'desc' },
        include: {
          sport: true,
          venue: true,
          ticketTypes: { include: { sector: true } },
          _count: { select: { ticketTypes: true } },
        },
      }),
    });
  } catch (err) {
    next(err);
  }
});
router.post('/events', async (req, res, next) => {
  try {
    const data = eventSchema.parse(req.body);
    res.status(201).json({
      event: await prisma.event.create({
        data: { ...data, startsAt: new Date(data.startsAt) },
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/events/import-belarus', async (_req, res, next) => {
  try {
    res.json(await importBelarusEvents());
  } catch (err) {
    next(err);
  }
});

router.post('/events/import-cis', async (_req, res, next) => {
  try {
    res.json(await importCisSportsEvents());
  } catch (err) {
    next(err);
  }
});

router.get('/events/cis-preview', async (_req, res, next) => {
  try {
    res.json({ events: await getCisSportsEventsPreview() });
  } catch (err) {
    next(err);
  }
});

const importSelectedCisSchema = z.object({
  externalIds: z.array(z.string()).min(1).max(50),
});
router.post('/events/import-cis-selected', async (req, res, next) => {
  try {
    const data = importSelectedCisSchema.parse(req.body);
    res.json(await importSelectedCisSportsEvents(data.externalIds));
  } catch (err) {
    next(err);
  }
});
router.put('/events/:id', async (req, res, next) => {
  try {
    const data = eventSchema.partial().parse(req.body);
    res.json({
      event: await prisma.event.update({
        where: { id: req.params.id },
        data: {
          ...data,
          startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        },
      }),
    });
  } catch (err) {
    next(err);
  }
});
router.delete('/events/:id', async (req, res, next) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ----- Ticket Types -----
const ticketTypeSchema = z.object({
  eventId: z.string(),
  sectorId: z.string(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
});
router.post('/ticket-types', async (req, res, next) => {
  try {
    const data = ticketTypeSchema.parse(req.body);
    res.status(201).json({ ticketType: await prisma.ticketType.create({ data }) });
  } catch (err) {
    next(err);
  }
});
router.put('/ticket-types/:id', async (req, res, next) => {
  try {
    const data = ticketTypeSchema.partial().parse(req.body);
    res.json({
      ticketType: await prisma.ticketType.update({ where: { id: req.params.id }, data }),
    });
  } catch (err) {
    next(err);
  }
});
router.delete('/ticket-types/:id', async (req, res, next) => {
  try {
    await prisma.ticketType.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ----- Users -----
const userPatchSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  blocked: z.boolean().optional(),
  password: z.string().min(6).optional(),
});
router.get('/users', async (_req, res, next) => {
  try {
    res.json({
      users: await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          blocked: true,
          createdAt: true,
        },
      }),
    });
  } catch (err) {
    next(err);
  }
});
router.put('/users/:id', async (req, res, next) => {
  try {
    const data = userPatchSchema.parse(req.body);
    const updateData: Record<string, unknown> = {};
    if (data.role !== undefined) updateData.role = data.role;
    if (data.blocked !== undefined) updateData.blocked = data.blocked;
    if (data.password) updateData.passwordHash = await hashPassword(data.password);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        blocked: true,
      },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// ----- Orders -----
router.get('/orders', async (_req, res, next) => {
  try {
    res.json({
      orders: await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, name: true } },
          items: {
            include: {
              ticketType: {
                include: { event: { select: { title: true } }, sector: { select: { name: true } } },
              },
            },
          },
          payment: true,
          promoCode: true,
        },
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/cancel', async (req, res, next) => {
  try {
    // Cascade-delete order items so seats become available again.
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: req.params.id } });
      await tx.order.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED', total: 0 },
      });
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post('/orders/check-ticket', async (req, res, next) => {
  try {
    const data = z.object({ ticketCode: z.string().min(4).max(100) }).parse(req.body);
    const item = await prisma.orderItem.findUnique({
      where: { ticketCode: data.ticketCode.trim().toUpperCase() },
      include: {
        order: { include: { user: { select: { email: true, name: true } } } },
        ticketType: { include: { event: { include: { venue: true, sport: true } }, sector: true } },
      },
    });
    res.json({
      valid: Boolean(item && item.order.status === 'PAID' && !item.refunded),
      ticket: item,
    });
  } catch (err) {
    next(err);
  }
});

const promoSchema = z.object({
  code: z.string().trim().min(3).max(30),
  description: z.string().trim().max(200).optional().nullable(),
  percentOff: z.number().int().min(1).max(90),
  active: z.boolean().default(true),
  expiresAt: z.string().optional().nullable(),
});

router.get('/promos', async (_req, res, next) => {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ promos });
  } catch (err) {
    next(err);
  }
});

router.post('/promos', async (req, res, next) => {
  try {
    const data = promoSchema.parse(req.body);
    const promo = await prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        percentOff: data.percentOff,
        active: data.active,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    res.status(201).json({ promo });
  } catch (err) {
    next(err);
  }
});

router.put('/promos/:id', async (req, res, next) => {
  try {
    const data = promoSchema.parse(req.body);
    const promo = await prisma.promoCode.update({
      where: { id: req.params.id },
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        percentOff: data.percentOff,
        active: data.active,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    res.json({ promo });
  } catch (err) {
    next(err);
  }
});

router.delete('/promos/:id', async (req, res, next) => {
  try {
    await prisma.promoCode.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get('/waitlist', async (_req, res, next) => {
  try {
    const subscriptions = await prisma.waitlistSubscription.findMany({
      where: { active: true },
      include: {
        user: { select: { email: true, name: true } },
        event: { include: { venue: true, sport: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ subscriptions });
  } catch (err) {
    next(err);
  }
});

router.post('/waitlist/:id/notify', async (req, res, next) => {
  try {
    const subscription = await prisma.waitlistSubscription.findUnique({
      where: { id: req.params.id },
      include: { event: true, user: true },
    });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    const { sendWaitlistNotification } = await import('../services/mailer.js');
    const result = await sendWaitlistNotification(
      subscription.user.email,
      subscription.user.name,
      subscription.event.title,
      subscription.event.startsAt.toLocaleDateString('ru-RU'),
    );

    const updated = await prisma.waitlistSubscription.update({
      where: { id: subscription.id },
      data: { active: false },
    });
    res.json({
      subscription: updated,
      message: `Уведомление отправлено на ${subscription.user.email} о событии: ${subscription.event.title}.`,
      previewUrl: result.previewUrl,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
