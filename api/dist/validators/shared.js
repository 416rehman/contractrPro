"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phone_validator = exports.password_validator = exports.email_validator = exports.username_validator = void 0;
const express_validator_1 = require("express-validator");
exports.username_validator = (0, express_validator_1.check)('username')
    .exists()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be at least 3 characters long');
exports.email_validator = (0, express_validator_1.check)('email')
    .exists()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid');
exports.password_validator = (0, express_validator_1.check)('password')
    .exists()
    .withMessage('Password is required')
    .isLength({ min: 3 })
    .withMessage('Password must be at least 3 characters long');
exports.phone_validator = (0, express_validator_1.check)('phone')
    .exists()
    .withMessage('Phone is required')
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone must be 20 digits long at max');
