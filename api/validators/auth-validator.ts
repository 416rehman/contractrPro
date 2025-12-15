import { oneOf } from 'express-validator';
import {
    password_validator,
    email_validator,
    username_validator,
} from './shared';

export const GetAccountTokenValidator = [
    oneOf([username_validator, email_validator]),
    password_validator,
];

export const RegisterAccountValidator = [
    username_validator,
    email_validator,
    password_validator,
];
