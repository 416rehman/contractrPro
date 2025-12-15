"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationErrorsHandler = void 0;
const express_validator_1 = require("express-validator");
const ValidationErrorsHandler = function (req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};
exports.ValidationErrorsHandler = ValidationErrorsHandler;
