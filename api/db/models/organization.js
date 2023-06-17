const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Organization = sequelize.define(
        'Organization',
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
            description: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(25),
                allowNull: false,
            },
            website: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            logoUrl: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            paranoid: true,
        }
    )

    Organization.associate = (models) => {
        Organization.belongsToMany(models.User, {
            through: 'OrganizationMember',
        })

        Organization.hasOne(models.Address, {
            foreignKey: { allowNull: true },
        })

        Organization.hasMany(models.Client, {
            foreignKey: { allowNull: false },
        })

        Organization.hasMany(models.Contract, {
            foreignKey: { allowNull: false },
        })

        Organization.hasMany(models.Vendor, {
            foreignKey: { allowNull: false },
        })

        Organization.hasMany(models.Expense, {
            foreignKey: { allowNull: false },
        })

        Organization.hasMany(models.Invoice, {
            foreignKey: { allowNull: false },
        })

        Organization.belongsTo(models.User, {
            as: 'owner',
            foreignKey: {
                allowNull: false,
            },
        })

        Organization.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return Organization
}
