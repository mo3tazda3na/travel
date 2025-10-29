import { Router } from 'express';
import container from '../../../../container.js';
import { tripToResponse } from '../../presenters/tripPresenter.js';
import HttpError from '../../errors/HttpError.js';
import { sendSuccess } from '../../utils/response.js';
import RequestRule from '../../validation/RequestRule.js';
import validateRequest from '../../validation/index.js';
import {
  string,
  number,
  isoDateString,
  enumeration,
} from '../../validation/validators.js';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';

const router = Router();

const getTripRules = () => ({
  params: {
    id: new RequestRule(number({ integer: true, min: 1 }), { required: true }),
  },
});

const createTripRules = () => ({
  body: {
    name: new RequestRule(string({ minLength: 1 }), { required: true }),
    description: new RequestRule(string(), {
      required: false,
      defaultValue: '',
    }),
    start_date: new RequestRule(isoDateString(), { required: true }),
    end_date: new RequestRule(isoDateString(), {
      required: false,
      defaultValue: null,
    }),
    visibility: new RequestRule(
      enumeration(['private', 'public']),
      { required: false, defaultValue: 'private' }
    ),
  },
});

const loadTripResource = async (req) => {
  const validation = validateRequest(req, getTripRules());
  req.validated = { ...(req.validated || {}), ...validation };
  const trip = await container.getTripUseCase.execute(validation.params.id);

  if (!trip) {
    throw new HttpError({
      status: 404,
      code: 'TRIP_NOT_FOUND',
      message: 'Trip not found',
      src: 'http:trips:loadTrip',
    });
  }

  return trip;
};

router.use(authenticate);

router.get(
  '/',
  authorize('trip:list'),
  async (req, res, next) => {
    try {
      const decision = req.authz?.['trip:list']?.decision;
      const trips = await container.listTripsUseCase.execute({
        user: req.user,
        constraints: decision?.constraints,
      });
      sendSuccess(res, trips.map(tripToResponse));
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  authorize('trip:view', {
    resource: async (req) => {
      const trip = await loadTripResource(req);
      return trip;
    },
    attach: (req, { resource }) => {
      req.trip = resource;
    },
  }),
  async (req, res, next) => {
    try {
      const trip = req.trip || (await loadTripResource(req));
      sendSuccess(res, tripToResponse(trip));
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  authorize('trip:create'),
  async (req, res, next) => {
    try {
      const { body } = validateRequest(req, createTripRules());

      const trip = await container.createTripUseCase.execute({
        userId: req.user.id,
        name: body.name,
        description: body.description ?? '',
        startDate: body.start_date,
        endDate: body.end_date ?? null,
        visibility: body.visibility ?? 'private',
      });

      sendSuccess(res, tripToResponse(trip), { status: 201 });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
