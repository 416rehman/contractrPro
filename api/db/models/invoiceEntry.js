const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const InvoiceEntry = sequelize.define('InvoiceEntry', {
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
        unitCost: {
            type: DataTypes.FLOAT(),
            allowNull: false,
        },
    })

    InvoiceEntry.associate = (models) => {
        InvoiceEntry.belongsTo(models.Invoice, {
            foreignKey: {
                allowNull: false,
            },
            onDelete: 'CASCADE',
        }) // the invoice that owns this invoice entry
    }

    return InvoiceEntry
}
