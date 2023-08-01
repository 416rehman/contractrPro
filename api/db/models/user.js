const { Sequelize } = require('sequelize')
const { readFlags } = require('../../utils/flags')
const { hashSync } = require('bcrypt')
const { generateRefreshToken } = require('../../utils')

module.exports.UserFlags = {
    // The types of tokens that can be created. These are stored as a bitmask in the Token.flags field and can store 16 different types of tokens
    ROLE_ADMIN: 1, // The user is an admin of this application and has access to all endpoints
    VERIFIED_EMAIL: 2, // The user's current email address has been verified
    VERIFIED_PHONE: 4, // The user's current phone number has been verified
    NA_BANNED: 8, // NA stands for Not Applicable, this flag is used to ban users
}

function passwordChangeHook(user) {
    // validate the password
    if (!user.password || user.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
    }
    user.password = hashSync(user.password, 10)
    user.refreshToken = generateRefreshToken()
}

module.exports.define = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            username: {
                type: DataTypes.STRING(32),
                allowNull: false,
                unique: true,
                validate: {
                    // We require usernames to have length of at least 3, and
                    // only use letters, numbers, underscores, dashes, and dots.
                    is: {
                        args: /^[a-z0-9_.-]{3,}$/i,
                        msg: 'Username must be at least 3 characters long and can only contain letters, numbers, underscores, dashes, and dots',
                    },
                },
            },
            name: {
                type: DataTypes.STRING(512),
                get() {
                    const name = this.getDataValue('name')
                    return name ? name : this.getDataValue('username')
                },
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            phoneCountry: {
                type: DataTypes.STRING(5), // This is the country code
                validate: {
                    is: {
                        args: /^[0-9]{1,5}$/, // Must be a number between 1 and 5 digits long
                        msg: 'Phone country must be a number between 1 and 5 digits long',
                    },
                },
            },
            phoneNumber: {
                type: DataTypes.STRING(20), // This is the phone number without the country code
                validate: {
                    is: {
                        args: /^[0-9]{1,20}$/, // Must be a number between 1 and 20 digits long
                        msg: 'Phone number must be a number between 1 and 20 digits long',
                    },
                },
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            avatarUrl: {
                type: DataTypes.STRING(1024),
                allowNull: true,
            },
            refreshToken: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: generateRefreshToken(),
            },
            flags: {
                // Flags are stored as a bitmask in a single integer field
                // You can use functions such as readFlags(), isFlagSet(), setFlag(), unsetFlag() from api\utils\tokenFlags.js to manipulate the tokenFlags
                type: Sequelize.SMALLINT, // 16 bits/flags
                allowNull: true,
                // defaultValue: '0',
                get() {
                    return readFlags(
                        this.getDataValue('flags'),
                        module.exports.UserFlags
                    )
                },
            },
        },
        {
            hooks: {
                beforeCreate: (user) => {
                    passwordChangeHook(user)
                },
                beforeUpdate: (user) => {
                    if (user.changed('password')) {
                        passwordChangeHook(user)
                    }
                },
            },
            indexes: [
                {
                    unique: true,
                    fields: ['phoneCountry', 'phoneNumber'],
                },
            ],
        }
    )

    User.associate = (models) => {
        User.belongsToMany(models.Organization, {
            through: 'OrganizationMember',
            onDelete: 'SET NULL', // If the user is deleted, the associated OrganizationMember is not deleted.
        })

        User.hasOne(models.Address, {
            foreignKey: { allowNull: true },
        })

        User.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })

        User.hasMany(models.Token, {
            foreignKey: { allowNull: false },
            onDelete: 'CASCADE',
        })
    }

    return User
}
