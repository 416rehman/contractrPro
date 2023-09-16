// authresettoken.js

const { Sequelize } = require('sequelize')
const { readFlags } = require('../../src/utils/flags')
/**
 * The token model is used to store the tokens for password reset, email verification, phone verification, etc.
 * These tokens do not have anything to do with the RefreshToken and AccessTokens used for authentication.
 * These tokens are used for other purposes such as password reset, email verification, phone verification, and other temporary tokens.
 */



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

    return Token
}
