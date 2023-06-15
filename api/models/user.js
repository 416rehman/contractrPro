const { Sequelize } = require('sequelize')
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
                    // only use letters, numbers and underscores.
                    is: /^\w{3,}$/,
                },
            },
            full_name: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            phone: {
                type: DataTypes.STRING(25),
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            avatar_url: {
                type: DataTypes.STRING(1024),
                allowNull: false,
            },
            refresh_token: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            paranoid: true,
        },
    )

    User.associate = (models) => {
        User.belongsTo(models.User, {
            foreignKey: {
                name: 'updated_by',
            },
        })
    }

    return User
}
