import express from 'express';
import { prisma } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
});

export default router;
