const { generateRandomCode } = require('./index')
module.exports.tokenFlags = {
    // The types of tokens that can be created. These are stored as a bitmask in the Token.flags field and can store 16 different types of tokens
    // All these tokens can be used in the POST /confirm endpoint
    USER_PASSWORD_RESET_TOKEN: 1, // This code is for password reset. No associated data, new password must be sent in the body.data field of the request
    USER_EMAIL_VERIFY_TOKEN: 2, // This code is for email verification. Associated data is the new email address
    USER_PHONE_VERIFY_TOKEN: 4, // This code is for phone verification. Associated data is the new phone number
}
/**
 * Create a token for password reset
 * @param UserId  The user for whom the token is being created
 * @returns {{UserId: *, token: string, expiresAt: Date, flags: number, data: *}} The token object that can be inserted into the database
 */
module.exports.passwordResetTokenTemplate = (UserId) => {
    return {
        UserId,
        token: generateRandomCode(128),
        expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 24 hours
        flags: module.exports.tokenFlags.USER_PASSWORD_RESET_TOKEN,
    }
}

/**
 * Create a token for email verification
 * @param UserId  The user for whom the token is being created
 * @param email After the token is used, the user's email will be set to this value
 * @returns {{UserId: *, token: string, expiresAt: Date, flags: number, data: *}} The token object that can be inserted into the database
 */
module.exports.emailVerifyTokenTemplate = (UserId, email) => {
    return {
        UserId,
        token: generateRandomCode(32),
        expiresAt: new Date(new Date().getTime() + 72 * 60 * 60 * 1000), // 72 hours
        flags: module.exports.tokenFlags.USER_EMAIL_VERIFY_TOKEN,
        data: email,
    }
}

/**
 * Create a token for phone verification
 * @param UserId  The user for whom the token is being created
 * @param phoneCountry  After the token is used, the user's phoneCountry will be set to this value
 * @param phoneNumber  After the token is used, the user's phoneNumber will be set to this value
 * @returns {{UserId: *, token: string, expiresAt: Date, flags: number, data: *}} The token object that can be inserted into the database
 */
module.exports.phoneVerifyTokenTemplate = (UserId, phoneCountry, phoneNumber) => {
    return {
        UserId,
        token: generateRandomCode(6), // 6 digit code for phone verification
        expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 24 hours
        flags: module.exports.tokenFlags.USER_PHONE_VERIFY_TOKEN,
        data: JSON.stringify({ phoneCountry, phoneNumber }),
    }
}
