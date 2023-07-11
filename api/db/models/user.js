const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
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
                is: /^[a-z0-9_.-]{3,}$/i,
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
        phone: {
            type: DataTypes.STRING(25),
            unique: true,
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
        },
    })

    User.associate = (models) => {
        User.belongsToMany(models.Organization, {
            through: 'OrganizationMember',
        })

        User.hasOne(models.Address, {
            foreignKey: { allowNull: true },
        })

        User.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })
    }

    return User
}
