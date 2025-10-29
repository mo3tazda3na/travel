import { Router } from 'express';
import container from '../../../../container.js';
import { locationToResponse } from '../../presenters/locationPresenter.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const locations = await container.listLocationsUseCase.execute();
    res.json(locations.map(locationToResponse));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { trip_id, city, country, lat, lng, notes, image_url, visited_at } = req.body;

    if (!trip_id || !city || !country || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'trip_id, city, country, lat, and lng are required' });
    }

    const latValue = Number(lat);
    const lngValue = Number(lng);

    if (Number.isNaN(latValue) || Number.isNaN(lngValue)) {
      return res.status(400).json({ message: 'lat and lng must be valid numbers' });
    }

    const location = await container.addLocationToTripUseCase.execute(trip_id, {
      city,
      country,
      latitude: latValue,
      longitude: lngValue,
      notes: notes || '',
      imageUrl: image_url || null,
      visitedAt: visited_at || null
    });

    res.status(201).json(locationToResponse(location));
  } catch (error) {
    next(error);
  }
});

export default router;
