const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
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
        },
    )
}

module.exports.associate = (ExpenseEntry, models) => {
    ExpenseEntry.belongsTo(models.Expense)   // the expense that owns this expense entry

    ExpenseEntry.belongsTo(models.User, {
        foreignKey: {
                        name: 'updated_by',
        }
    })

    return ExpenseEntry
}
