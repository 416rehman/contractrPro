"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterAccountValidator = exports.GetAccountTokenValidator = void 0;
const express_validator_1 = require("express-validator");
const shared_1 = require("./shared");
exports.GetAccountTokenValidator = [
    (0, express_validator_1.oneOf)([shared_1.username_validator, shared_1.email_validator]),
    shared_1.password_validator,
];
exports.RegisterAccountValidator = [
    shared_1.username_validator,
    shared_1.email_validator,
    shared_1.password_validator,
];
