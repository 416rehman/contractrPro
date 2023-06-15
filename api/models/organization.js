const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
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
            logo_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            paranoid: true,
        }
    )
}

module.exports.associate = (Organization, models) => {
    Organization.belongsTo(models.User, {
        foreignKey: {
            name: 'owner_id',
            allowNull: false,
        },
    })

    Organization.belongsTo(models.User, {
        foreignKey: {
            name: 'updated_by',
        },
    })

    return Organization
}
