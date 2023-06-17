const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Invoice = sequelize.define(
        'Invoice',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            invoiceNumber: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            invoiceDate: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            dueDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            poNumber: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            note: {
                type: DataTypes.STRING(512),
                allowNull: true,
            },
            taxRate: {
                type: DataTypes.FLOAT(),
                allowNull: false,
                defaultValue: 0,
            }
        },
        {
            paranoid: true,
        },
    )

    Invoice.associate = (models) => {
        // An invoice belongs to an organization
        Invoice.belongsTo(models.Organization, {
            foreignKey: {
                allowNull: false,
            },
        })

        Invoice.belongsTo(models.Contract) // the contract this invoice was derived from
        Invoice.belongsTo(models.Job)   // the job this invoice was derived from

        Invoice.hasMany(models.InvoiceEntry, {
            onDelete: 'CASCADE',
        })

        Invoice.belongsTo(models.Client, {
            as: 'billToClient',
        })

        Invoice.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return Invoice
}
