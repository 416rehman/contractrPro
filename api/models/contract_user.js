module.exports.contract_users = (sequelize, DataTypes) => {
    return sequelize.define("Contract_Users", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        organization_user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        contract_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        permission_overwrites: {
            type: DataTypes.BIGINT,
        },
        updated_by: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
    }, {
        paranoid: true,
    });
}