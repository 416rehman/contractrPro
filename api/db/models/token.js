// authresettoken.js

const { Sequelize } = require('sequelize')
const { readFlags } = require('../../utils/flags')
const { generateRandomCode } = require('../../utils')

/**
 * The token model is used to store the tokens for password reset, email verification, phone verification, etc.
 * These tokens do not have anything to do with the RefreshToken and AccessTokens used for authentication.
 * These tokens are used for other purposes such as password reset, email verification, phone verification, and other temporary tokens.
 */

module.exports.tokenFlags = {
    // The types of tokens that can be created. These are stored as a bitmask in the Token.flags field and can store 16 different types of tokens
    // All these tokens can be used in the POST /confirm endpoint
    USER_PASSWORD_RESET_TOKEN: 1, // This code is for password reset. No associated data, new password must be sent in the body.data field of the request
    USER_EMAIL_VERIFY_TOKEN: 2, // This code is for email verification. Associated data is the new email address
    USER_PHONE_VERIFY_TOKEN: 4, // This code is for phone verification. Associated data is the new phone number
}

module.exports.define = (sequelize, DataTypes) => {
    const Token = sequelize.define(
        'Token',
        {
            // This table is used to store the tokens for password reset, email verification, phone verification, etc.
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            token: {
                type: DataTypes.STRING(128),
                allowNull: false,
                unique: true,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            flags: {
                // Flags are stored as a bitmask in a single integer field
                // You can use functions such as readFlags(), isFlagSet(), setFlag(), unsetFlag() from api\utils\tokenFlags.js to manipulate the tokenFlags
                type: Sequelize.SMALLINT, // 16 bits/flags
                allowNull: false,
                defaultValue: '0',
                get() {
                    return readFlags(
                        this.getDataValue('flags') || 0,
                        module.exports.tokenFlags
                    )
                },
                // constraint that makes sure a combination of UserId and tokenFlags is unique (so that we can't have multiple tokens for the same user with the same flag)
                unique: 'userFlagConstraint',
            },
            data: {
                // This field can be used to store any additional data that you want to store along with the token..
                // i.e an email verification token can store the email address in this field and then the user's email can be set to this value when the token is used
                // i.e a phone verification token can store the phone number in this field and then the user's phone can be set to this value when the token is used
                // i.e a password reset token will not need to store any data in this field as the user will provide the new password in the POST /auth/reset endpoint along with the token
                type: DataTypes.STRING(1024),
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['UserId', 'flags'], // Create index for uniqueness per user and flag
                },
            ],
        }
    )

    Token.associate = (models) => {
        Token.belongsTo(models.User, {
            foreignKey: { allowNull: false },
            onDelete: 'CASCADE',
        })
    }

    /**
     * Create a token for password reset and insert it into the database
     * @param UserId  The user for whom the token is being created
     * @returns {{UserId: *, token: string, expiresAt: Date, flags: number, data: *}} The token object that can be inserted into the database
     */
    Token.passwordResetTokenTemplate = (UserId) => {
        return {
            UserId,
            token: generateRandomCode(128),
            expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 24 hours
            flags: module.exports.tokenFlags.USER_PASSWORD_RESET_TOKEN,
        }
    }

    /**
     * Create a token for email verification and insert it into the database
     * @param UserId  The user for whom the token is being created
     * @param email After the token is used, the user's email will be set to this value
     * @returns {{UserId: *, token: string, expiresAt: Date, flags: number, data: *}} The token object that can be inserted into the database
     */
    Token.emailVerifyTokenTemplate = (UserId, email) => {
        return {
            UserId,
            token: generateRandomCode(32),
            expiresAt: new Date(new Date().getTime() + 72 * 60 * 60 * 1000), // 72 hours
            flags: module.exports.tokenFlags.USER_EMAIL_VERIFY_TOKEN,
            data: email,
        }
    }

    /**
     * Create a token for phone verification and insert it into the database
     * @param UserId  The user for whom the token is being created
     * @param phone  After the token is used, the user's phone will be set to this value
     * @returns {{UserId: *, token: string, expiresAt: Date, flags: number, data: *}} The token object that can be inserted into the database
     */
    Token.phoneVerifyTokenTemplate = (UserId, phone) => {
        return {
            UserId,
            token: generateRandomCode(6), // 6 digit code for phone verification
            expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 24 hours
            flags: module.exports.tokenFlags.USER_PHONE_VERIFY_TOKEN,
            data: phone,
        }
    }

    return Token
}
