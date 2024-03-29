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
            expenseNumber: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING(512),
                allowNull: true,
            },
            date: {
                type: DataTypes.DATE,
            },
            taxRate: {
                type: DataTypes.FLOAT(),
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['expenseNumber', 'OrganizationId'],
                },
            ],
        }
    )

    Expense.associate = (models) => {
        // Expenses belong to an organization.
        Expense.belongsTo(models.Organization, {
            onDelete: 'CASCADE',
            foreignKey: {
                allowNull: false,
            },
        })

        Expense.belongsTo(models.Contract) // the contract this expense is linked to
        Expense.belongsTo(models.Job) // the job this expense is linked to

        Expense.belongsTo(models.Vendor) // the vendor who provided the service

        Expense.hasMany(models.ExpenseEntry)

        Expense.hasMany(models.Comment, {
            onDelete: 'CASCADE',
        })

        Expense.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })
    }

    return Expense
}
