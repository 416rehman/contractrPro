module.exports.contract_users = (sequelize, DataTypes) => {
    return sequelize.define("Contract_Users", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        organization_user_id: {
            type: DataTypes.INTEGER,
        },
        contract_id: {
            type: DataTypes.INTEGER,
        },
        permission_overwrites: {
            type: DataTypes.BIGINT,
        },
    });
}