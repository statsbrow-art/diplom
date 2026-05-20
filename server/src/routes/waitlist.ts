import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../auth.js';
import { prisma } from '../db.js';

const router = Router();

const subscribeSchema = z.object({
  eventId: z.string(),
  notifyBy: z.enum(['email', 'site']).default('email'),
});

router.use(authenticate);

router.get('/mine', async (req, res, next) => {
  try {
    const subscriptions = await prisma.waitlistSubscription.findMany({
      where: { userId: req.user!.id, active: true },
      include: { event: { include: { sport: true, venue: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ subscriptions });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = subscribeSchema.parse(req.body);
    const subscription = await prisma.waitlistSubscription.upsert({
      where: { userId_eventId: { userId: req.user!.id, eventId: data.eventId } },
      update: { active: true, notifyBy: data.notifyBy },
      create: { userId: req.user!.id, eventId: data.eventId, notifyBy: data.notifyBy },
    });
    res.status(201).json({ subscription });
  } catch (err) {
    next(err);
  }
});

router.delete('/:eventId', async (req, res, next) => {
  try {
    await prisma.waitlistSubscription.update({
      where: { userId_eventId: { userId: req.user!.id, eventId: req.params.eventId } },
      data: { active: false },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
