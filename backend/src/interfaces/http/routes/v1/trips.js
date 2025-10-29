import { Router } from 'express';
import container from '../../../../container.js';
import { tripToResponse } from '../../presenters/tripPresenter.js';
import HttpError from '../../errors/HttpError.js';
import { sendSuccess } from '../../utils/response.js';
import RequestRule from '../../validation/RequestRule.js';
import validateRequest from '../../validation/index.js';
import { string, number, isoDateString } from '../../validation/validators.js';

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
  },
});

router.get('/', async (_req, res, next) => {
  try {
    const trips = await container.listTripsUseCase.execute();
    sendSuccess(res, trips.map(tripToResponse));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { params } = validateRequest(req, getTripRules());
    const trip = await container.getTripUseCase.execute(params.id);
    if (!trip) {
      throw new HttpError({
        status: 404,
        code: 'TRIP_NOT_FOUND',
        message: 'Trip not found',
        src: 'http:trips:getById',
      });
    }
    sendSuccess(res, tripToResponse(trip));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { body } = validateRequest(req, createTripRules());

    const trip = await container.createTripUseCase.execute({
      name: body.name,
      description: body.description ?? '',
      startDate: body.start_date,
      endDate: body.end_date ?? null,
    });

    sendSuccess(res, tripToResponse(trip), { status: 201 });
  } catch (error) {
    next(error);
  }
});

export default router;
