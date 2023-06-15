const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Vendor = sequelize.define(
        'Vendor', // a vendor is a company that provides services to the organization
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

    Vendor.associate = (models) => {
        Vendor.belongsTo(models.Organization) // the organization that owns this client
        Vendor.belongsTo(models.User, {
            foreignKey: {
                name: 'updated_by',
            },
        })
    }

    return Vendor
}
