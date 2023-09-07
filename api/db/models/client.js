const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Client = sequelize.define(
        'Client',
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
                    fields: ['OrganizationId', 'email'], // Create index for uniqueness per organization and email
                    unique: {
                        args: true,
                        msg: 'Email already in use by another client',
                    },
                },
                {
                    fields: ['OrganizationId', 'phone'], // Create index for uniqueness per organization and phone
                    unique: {
                        args: true,
                        msg: 'Phone already in use by another client',
                    },
                },
            ],
        }
    )

    Client.associate = (models) => {
        Client.hasMany(models.Contract, {
            foreignKey: { allowNull: false },
        })
        Client.hasOne(models.Address, {
            foreignKey: { allowNull: true },
        })

        Client.hasMany(models.Comment, {
            onDelete: 'CASCADE',
        })

        Client.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })
    }

    return Client
}
