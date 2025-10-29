import { Router } from 'express';
import container from '../../../../container.js';
import { locationToResponse } from '../../presenters/locationPresenter.js';
import { sendSuccess } from '../../utils/response.js';
import RequestRule from '../../validation/RequestRule.js';
import {
  string,
  number,
  isoDateString,
  url as urlValidator,
} from '../../validation/validators.js';
import validateRequest from '../../validation/index.js';

const router = Router();

const createLocationRules = () => ({
  body: {
    trip_id: new RequestRule(number({ integer: true, min: 1 }), {
      required: true,
    }),
    city: new RequestRule(string({ minLength: 1 }), { required: true }),
    country: new RequestRule(string({ minLength: 1 }), { required: true }),
    lat: new RequestRule(number({ min: -90, max: 90 }), { required: true }),
    lng: new RequestRule(number({ min: -180, max: 180 }), { required: true }),
    notes: new RequestRule(string(), { required: false, defaultValue: '' }),
    image_url: new RequestRule(urlValidator(), {
      required: false,
      defaultValue: null,
    }),
    visited_at: new RequestRule(isoDateString(), {
      required: false,
      defaultValue: null,
    }),
  },
});

router.get('/', async (_req, res, next) => {
  try {
    const locations = await container.listLocationsUseCase.execute();
    sendSuccess(res, locations.map(locationToResponse));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { body } = validateRequest(req, createLocationRules());

    const location = await container.addLocationToTripUseCase.execute(
      body.trip_id,
      {
        city: body.city,
        country: body.country,
        latitude: body.lat,
        longitude: body.lng,
        notes: body.notes ?? '',
        imageUrl: body.image_url ?? null,
        visitedAt: body.visited_at ?? null,
      }
    );

    sendSuccess(res, locationToResponse(location), { status: 201 });
  } catch (error) {
    next(error);
  }
});

export default router;
