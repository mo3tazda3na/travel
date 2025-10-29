import { Router } from 'express';
import { createLocation, listLocations } from '../../models/location.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const locations = await listLocations();
    res.json(locations);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { trip_id, city, country, lat, lng, notes, image_url, visited_at } = req.body;
    if (!trip_id || !city || !country || !lat || !lng) {
      return res.status(400).json({ message: 'trip_id, city, country, lat, and lng are required' });
    }

    const location = await createLocation({
      trip_id,
      city,
      country,
      lat,
      lng,
      notes: notes || '',
      image_url: image_url || null,
      visited_at: visited_at || null
    });
    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
});

export default router;
