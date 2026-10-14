import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (rules: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const rule of rules) {
      await rule.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  };
};

export const validators = {
  login: [
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6 })
  ],
  registerUniversity: [
    body('name').isString(),
    body('country').isString(),
    body('districtCity').isString()
  ],
  createElection: [
    body('title').isString(),
    body('startAt').isISO8601(),
    body('endAt').isISO8601()
  ]
};
