const { validationResult } = require('express-validator');
module.exports.ValidationErrorsHandler = function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};