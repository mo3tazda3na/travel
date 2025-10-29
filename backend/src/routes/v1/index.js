import { Router } from 'express';
import tripsRouter from './trips.js';
import locationsRouter from './locations.js';

const router = Router();

router.use('/trips', tripsRouter);
router.use('/locations', locationsRouter);

export default router;
