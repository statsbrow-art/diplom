import { Router } from 'express';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { prisma } from '../db.js';
import { authenticate } from '../auth.js';
import { HttpError } from '../middleware/error.js';
import { cardBrand, cardLast4, isValidCardNumber, parseExpiry } from '../cardValidation.js';

const router = Router();

const createOrderSchema = z.object({
  eventId: z.string(),
  payment: z
    .object({
      cardHolder: z.string().min(2).max(100),
      cardNumber: z.string().regex(/^\d{13,19}$/),
      expiry: z.string().regex(/^\d{2}\/\d{2}$/),
      cvv: z.string().regex(/^\d{3,4}$/),
    })
    .optional(),
  promoCode: z.string().trim().max(30).optional(),
  seats: z
    .array(
      z.object({
        ticketTypeId: z.string(),
        row: z.number().int().min(1),
        number: z.number().int().min(1),
      }),
    )
    .min(1)
    .max(20),
});

function ticketCode(): string {
  return randomBytes(6).toString('hex').toUpperCase();
}


router.use(authenticate);

router.get('/mine', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            ticketType: {
              include: { event: { include: { venue: true, sport: true } }, sector: true },
            },
          },
        },
        payment: true,
        promoCode: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

router.get('/validate-promo/:code', async (req, res, next) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    const valid = Boolean(
      promo?.active && (!promo.expiresAt || promo.expiresAt.getTime() > Date.now()),
    );
    res.json({
      valid,
      promo: valid
        ? {
            id: promo!.id,
            code: promo!.code,
            description: promo!.description,
            percentOff: promo!.percentOff,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/refund', async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { items: { include: { ticketType: { include: { event: true } } } }, payment: true },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.status !== 'PAID') throw new HttpError(400, 'Only paid orders can be refunded');
    const startsAt = order.items[0]?.ticketType.event.startsAt;
    if (startsAt && startsAt.getTime() <= Date.now()) {
      throw new HttpError(400, 'Event already started');
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'REFUNDED',
        items: { updateMany: { where: {}, data: { refunded: true } } },
        payment: order.payment ? { update: { status: 'REFUNDED' } } : undefined,
      },
      include: {
        items: {
          include: {
            ticketType: {
              include: { event: { include: { venue: true, sport: true } }, sector: true },
            },
          },
        },
        payment: true,
        promoCode: true,
      },
    });
    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      include: {
        ticketTypes: { include: { sector: true } },
      },
    });
    if (!event) throw new HttpError(404, 'Event not found');
    if (event.status !== 'ON_SALE' && event.status !== 'SCHEDULED') {
      throw new HttpError(400, 'Event not available for purchase');
    }
    if (data.payment) {
      if (!isValidCardNumber(data.payment.cardNumber) || !parseExpiry(data.payment.expiry)) {
        throw new HttpError(400, 'Invalid payment card');
      }
    }

    const promoCodeValue = data.promoCode?.trim().toUpperCase();
    const promoCode = promoCodeValue
      ? await prisma.promoCode.findUnique({ where: { code: promoCodeValue } })
      : null;
    if (
      promoCodeValue &&
      (!promoCode || !promoCode.active || (promoCode.expiresAt && promoCode.expiresAt <= new Date()))
    ) {
      throw new HttpError(400, 'Invalid promo code');
    }

    const ttMap = new Map(event.ticketTypes.map((t) => [t.id, t]));
    let subtotal = 0;
    for (const seat of data.seats) {
      const tt = ttMap.get(seat.ticketTypeId);
      if (!tt) throw new HttpError(400, 'Invalid ticket type');
      if (seat.row > tt.sector.rows || seat.number > tt.sector.seatsPerRow) {
        throw new HttpError(400, 'Seat out of range');
      }
      subtotal += Number(tt.price);
    }
    const discount = promoCode ? Math.round(subtotal * promoCode.percentOff) / 100 : 0;
    const total = Math.max(subtotal - discount, 0);

    try {
      const order = await prisma.order.create({
        data: {
          userId: req.user!.id,
          total,
          discount,
          promoCodeId: promoCode?.id,
          status: 'PAID',
          payment: data.payment
            ? {
                create: {
                  amount: total,
                  discount,
                  cardBrand: cardBrand(data.payment.cardNumber),
                  cardLast4: cardLast4(data.payment.cardNumber),
                  status: 'PAID',
                },
              }
            : undefined,
          items: {
            create: data.seats.map((s) => ({
              ticketTypeId: s.ticketTypeId,
              seatRow: s.row,
              seatNumber: s.number,
              price: ttMap.get(s.ticketTypeId)!.price,
              ticketCode: ticketCode(),
            })),
          },
        },
        include: {
          items: {
            include: {
              ticketType: {
                include: {
                  event: { include: { venue: true, sport: true } },
                  sector: true,
                },
              },
            },
          },
          payment: true,
          promoCode: true,
        },
      });
      res.status(201).json({ order });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new HttpError(409, 'One or more seats already taken');
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

export default router;
