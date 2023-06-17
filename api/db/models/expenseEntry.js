const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const ExpenseEntry = sequelize.define(
        'ExpenseEntry',
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
            unitCost: {
                type: DataTypes.FLOAT(),
                allowNull: false,
            },
        },
        {
            paranoid: true,
        }
    )
    ExpenseEntry.associate = (models) => {
        ExpenseEntry.belongsTo(models.Expense, {
            foreignKey: {
                allowNull: false,
            },
            onDelete: 'CASCADE',
        }) // the expense that owns this expense entry

        ExpenseEntry.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return ExpenseEntry
}
