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
        }
    )

    Vendor.associate = (models) => {
        Vendor.belongsTo(models.Organization, {
            onDelete: 'CASCADE',
        }) // the organization that owns this client

        Vendor.hasMany(models.Expense, {
            foreignKey: { allowNull: false },
        })

        Vendor.hasOne(models.Address, {
            foreignKey: { allowNull: true },
        })

        Vendor.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return Vendor
}
