module.exports.expense = (sequelize, DataTypes) => {
    return sequelize.define("Expense", {
        per_cost: DataTypes.FLOAT(),
        name: DataTypes.STRING(255),
        description: DataTypes.STRING(512),
        quantity: DataTypes.INTEGER(),
        contract_id: DataTypes.INTEGER,
        job_id: DataTypes.INTEGER,
    });
}
