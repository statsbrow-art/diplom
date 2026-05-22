import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate } from '../auth.js';
import { HttpError } from '../middleware/error.js';
import { cardBrand, digitsOnly, isValidCardNumber, parseExpiry } from '../cardValidation.js';

const router = Router();

const createCardSchema = z.object({
  holder: z.string().min(2).max(100),
  cardNumber: z.string().min(13).max(23),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/),
});

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const cards = await prisma.paymentCard.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ cards });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = createCardSchema.parse(req.body);
    const cardNumber = digitsOnly(data.cardNumber);
    const expiry = parseExpiry(data.expiry);
    if (!isValidCardNumber(cardNumber) || !expiry) {
      throw new HttpError(400, 'Invalid payment card');
    }
    const card = await prisma.paymentCard.create({
      data: {
        userId: req.user!.id,
        holder: data.holder,
        brand: cardBrand(cardNumber),
        last4: cardNumber.slice(-4),
        expiryMonth: expiry.month,
        expiryYear: expiry.year,
      },
    });
    res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const card = await prisma.paymentCard.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!card) throw new HttpError(404, 'Card not found');
    await prisma.paymentCard.delete({ where: { id: card.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
