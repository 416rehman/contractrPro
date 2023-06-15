const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
        'InvoiceEntry',
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
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            per_cost: {
                type: DataTypes.FLOAT(),
                allowNull: false,
            },
            tax: {
                type: DataTypes.FLOAT(),
                allowNull: false,
            },
        },
        {
            paranoid: true,
        }
    )
}

module.exports.associate = (InvoiceEntry, models) => {
    InvoiceEntry.belongsTo(models.Invoice) // the invoice that owns this invoice entry

    InvoiceEntry.belongsTo(models.User, {
        foreignKey: {
            name: 'updated_by',
        },
    })

    return InvoiceEntry
}
