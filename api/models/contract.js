module.exports.contract = (sequelize, DataTypes) => {
    return sequelize.define("Contract", {
        name: DataTypes.STRING(255),
        description: DataTypes.STRING(1024),
        bill_to: DataTypes.STRING(510),
        email: DataTypes.STRING(255),
        phone: DataTypes.STRING(24),
        organization_id: DataTypes.INTEGER,
    });
}