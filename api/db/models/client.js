const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Client = sequelize.define(
        'Client', // a client is an organization's customer
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(255),
            },
            email: {
                type: DataTypes.STRING(255),
            },
            website: {
                type: DataTypes.STRING(255),
            },
            description: {
                type: DataTypes.STRING(1024),
            },
        },
        {
            paranoid: true,
        }
    )

    Client.associate = (models) => {
        Client.hasMany(models.Contract, {
            foreignKey: { allowNull: false },
        })
        Client.hasOne(models.Address, {
            foreignKey: { allowNull: true },
        })

        Client.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return Client
}
