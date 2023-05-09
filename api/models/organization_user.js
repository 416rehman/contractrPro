module.exports.organization_users = (sequelize, DataTypes) => {
    return sequelize.define("Organization_Users", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        permissions: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
    });
}