import { validationResult } from 'express-validator';

export const ValidationErrorsHandler = function (req: any, res: any, next: any) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};
