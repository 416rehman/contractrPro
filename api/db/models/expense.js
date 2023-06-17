const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Expense = sequelize.define(
        'Expense',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            description: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            date: {
                type: DataTypes.DATE,
            },
        },
        {
            paranoid: true,
        }
    )

    Expense.associate = (models) => {
        // Expenses belong to an organization.
        Expense.belongsTo(models.Organization, {
            foreignKey: {
                allowNull: false,
            },
        })

        Expense.belongsTo(models.Contract) // the contract this expense was derived from
        Expense.belongsTo(models.Job) // the job this expense was derived from

        Expense.belongsTo(models.Vendor) // the vendor who provided the service

        Expense.hasMany(models.ExpenseEntry)

        Expense.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return Expense
}
