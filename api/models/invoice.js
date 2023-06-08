module.exports.invoice = (sequelize, DataTypes) => {
    return sequelize.define("Invoice", {
        note: DataTypes.STRING(512),
        contract_id: DataTypes.INTEGER,
    });
}
