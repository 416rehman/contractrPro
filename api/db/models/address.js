const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Address = sequelize.define('Address', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        country: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        postalCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        province: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        addressLine1: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        addressLine2: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
    })

    Address.associate = (models) => {
        Address.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return Address
}
