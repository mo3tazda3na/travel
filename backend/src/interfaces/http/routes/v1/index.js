import { Router } from 'express';
import tripsRouter from './trips.js';
import locationsRouter from './locations.js';
import authRouter from './auth.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/trips', tripsRouter);
router.use('/locations', locationsRouter);

export default router;
