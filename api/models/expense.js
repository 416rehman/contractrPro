module.exports.expense = (sequelize, DataTypes) => {
    return sequelize.define(
        'Expense',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
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
            contract_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            job_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            updated_by: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
        },
        {
            paranoid: true,
        }
    )
}
