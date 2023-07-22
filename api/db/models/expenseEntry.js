const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const ExpenseEntry = sequelize.define('ExpenseEntry', {
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
            allowNull: true,
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
    ExpenseEntry.associate = (models) => {
        ExpenseEntry.belongsTo(models.Expense, {
            onDelete: 'CASCADE',
            foreignKey: {
                allowNull: false,
            },
        }) // the expense that owns this expense entry
    }

    return ExpenseEntry
}
