import { Router } from 'express';
import container from '../../../../container.js';
import { tripToResponse } from '../../presenters/tripPresenter.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const trips = await container.listTripsUseCase.execute();
    res.json(trips.map(tripToResponse));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const trip = await container.getTripUseCase.execute(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(tripToResponse(trip));
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

    const trip = await container.createTripUseCase.execute({
      name,
      description: description || '',
      startDate: start_date,
      endDate: end_date || null
    });

    res.status(201).json(tripToResponse(trip));
  } catch (error) {
    next(error);
  }
});

export default router;
