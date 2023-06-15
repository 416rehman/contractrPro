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
            per_cost: {
                type: DataTypes.FLOAT(),
                allowNull: false,
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
            time: {
                type: DataTypes.DATE,
            },
        },
        {
            paranoid: true,
        },
    )

    Expense.associate = (models) => {
        // Expense can either belong to a job, a contract, or an organization
        Expense.belongsTo(models.Organization, {
            foreignKey: {
                allowNull: false,
            },
        }) // the organization that owns this expense
        Expense.belongsTo(models.Contract) // the contract that owns this expense
        Expense.belongsTo(models.Job) // the job that owns this expense

        Expense.belongsTo(models.Vendor) // the vendor who provided the service

        Expense.belongsTo(models.User, {
            foreignKey: {
                name: 'updated_by',
            },
        })
    }

    return Expense
}
