const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Address = sequelize.define(
        'Address',
        {
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
            postal_code: {
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
            address_line_1: {
                type: DataTypes.STRING(128),
                allowNull: false,
            },
            address_line_2: {
                type: DataTypes.STRING(128),
                allowNull: true,
            },
        },
        {
            paranoid: true,
        }
    )

    Address.associate = (models) => {
        Address.belongsTo(models.Organization)
        Address.belongsTo(models.User)
        Address.belongsTo(models.Client)

        Address.belongsTo(models.User, {
            foreignKey: {
                name: 'updated_by',
            },
        })
    }

    return Address
}
