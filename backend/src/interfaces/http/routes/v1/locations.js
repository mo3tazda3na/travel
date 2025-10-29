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
import authenticate from '../../middleware/authenticate.js';
import HttpError from '../../errors/HttpError.js';
import authorize from '../../middleware/authorize.js';

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

router.use(authenticate);

router.get(
  '/',
  authorize('location:list'),
  async (req, res, next) => {
    try {
      const decision = req.authz?.['location:list']?.decision;
      const locations = await container.listLocationsUseCase.execute({
        user: req.user,
        constraints: decision?.constraints,
      });
      sendSuccess(res, locations.map(locationToResponse));
    } catch (error) {
      next(error);
    }
  }
);

const loadTripForLocation = async (req) => {
  const validation = validateRequest(req, createLocationRules());
  req.validated = { ...(req.validated || {}), ...validation };

  const trip = await container.getTripUseCase.execute(validation.body.trip_id);

  if (!trip) {
    throw new HttpError({
      status: 404,
      code: 'TRIP_NOT_FOUND',
      message: 'Trip not found',
      src: 'locations:loadTrip',
    });
  }

  return trip;
};

router.post(
  '/',
  authorize('location:create', {
    resource: async (req) => loadTripForLocation(req),
    attach: (req, { resource }) => {
      req.trip = resource;
    },
  }),
  async (req, res, next) => {
    try {
      const { body } = req.validated || validateRequest(req, createLocationRules());

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

      if (!location) {
        throw new HttpError({
          status: 500,
          code: 'LOCATION_CREATE_FAILED',
          message: 'Unable to create location',
          src: 'locations:create',
        });
      }

      sendSuccess(res, locationToResponse(location), { status: 201 });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
