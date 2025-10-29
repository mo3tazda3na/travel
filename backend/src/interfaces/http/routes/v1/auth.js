import { Router } from 'express';
import container from '../../../../container.js';
import { sendSuccess } from '../../utils/response.js';
import RequestRule from '../../validation/RequestRule.js';
import validateRequest from '../../validation/index.js';
import { string, email as emailValidator } from '../../validation/validators.js';
import HttpError from '../../errors/HttpError.js';
import authenticate from '../../middleware/authenticate.js';

const router = Router();

const registerRules = () => ({
  body: {
    name: new RequestRule(string({ minLength: 1 }), { required: true }),
    email: new RequestRule(emailValidator(), { required: true }),
    password: new RequestRule(string({ minLength: 8 }), { required: true }),
  },
});

const loginRules = () => ({
  body: {
    email: new RequestRule(emailValidator(), { required: true }),
    password: new RequestRule(string({ minLength: 8 }), { required: true }),
  },
});

const userToResponse = (user) =>
  user
    ? {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscription_level: user.subscriptionLevel,
    }
    : null;

router.post('/register', async (req, res, next) => {
  try {
    const { body } = validateRequest(req, registerRules());
    const user = await container.registerUserUseCase.execute({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    const token = container.jwtService.sign({ sub: user.id });

    sendSuccess(
      res,
      {
        token,
        user: userToResponse(user),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 'USER_ALREADY_EXISTS') {
      next(
        new HttpError({
          status: 409,
          code: error.code,
          message: error.message,
          src: 'auth:register',
        })
      );
      return;
    }

    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { body } = validateRequest(req, loginRules());
    const user = await container.loginUserUseCase.execute({
      email: body.email,
      password: body.password,
    });

    const token = container.jwtService.sign({ sub: user.id });

    sendSuccess(res, {
      token,
      user: userToResponse(user),
    });
  } catch (error) {
    if (error.code === 'AUTH_INVALID_CREDENTIALS') {
      next(
        new HttpError({
          status: 401,
          code: error.code,
          message: error.message,
          src: 'auth:login',
        })
      );
      return;
    }

    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await container.getUserProfileUseCase.execute(req.user.id);
    if (!user) {
      throw new HttpError({
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        src: 'auth:me',
      });
    }

    sendSuccess(res, userToResponse(user));
  } catch (error) {
    next(error);
  }
});

export default router;
