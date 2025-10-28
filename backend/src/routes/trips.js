import { Router } from 'express';
import { createTrip, getTripById, listTrips } from '../models/trip.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const trips = await listTrips();
    res.json(trips);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description, start_date, end_date } = req.body;
    if (!name || !start_date) {
      return res.status(400).json({ message: 'Trip name and start date are required' });
    }

    const trip = await createTrip({
      name,
      description: description || '',
      start_date,
      end_date: end_date || null
    });
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
});

export default router;
