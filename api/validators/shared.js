const {check} = require("express-validator");
module.exports.username_validator = check('username')
    .exists()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be at least 3 characters long')

module.exports.email_validator = check('email')
    .exists()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid')

module.exports.password_validator = check('password')
    .exists()
    .withMessage('Password is required')
    .isLength({ min: 3 })
    .withMessage('Password must be at least 3 characters long')

module.exports.phone_validator = check('phone')
    .exists()
    .withMessage('Phone is required')
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone must be 20 digits long at max')
 