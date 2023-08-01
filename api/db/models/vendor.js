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
                unique: 'organizationConstraint', // Set unique constraint per organization
            },
            email: {
                type: DataTypes.STRING(255),
                unique: 'organizationConstraint', // Set unique constraint per organization
            },
            website: {
                type: DataTypes.STRING(255),
            },
            description: {
                type: DataTypes.STRING(1024),
            },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['OrganizationId', 'email'], // Create index for uniqueness per organization and email
                },
                {
                    unique: true,
                    fields: ['OrganizationId', 'phone'], // Create index for uniqueness per organization and phone
                },
            ],
        }
    )

    Vendor.associate = (models) => {
        Vendor.hasMany(models.Expense, {
            foreignKey: { allowNull: false },
        })

        Vendor.hasMany(models.Comment, {
            onDelete: 'CASCADE',
        })

        Vendor.hasOne(models.Address, {
            foreignKey: { allowNull: true },
        })

        Vendor.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })
    }

    return Vendor
}
