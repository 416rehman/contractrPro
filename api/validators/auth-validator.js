const { oneOf } = require('express-validator')
const {
    password_validator,
    email_validator,
    username_validator,
} = require('./shared')

module.exports.GetAccountTokenValidator = [
    oneOf([username_validator, email_validator]),
    password_validator,
]

module.exports.RegisterAccountValidator = [
    username_validator,
    email_validator,
    password_validator,
]
