module.exports.organization_users = (sequelize, DataTypes) => {
    return sequelize.define("Organization_Users", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        organization_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        permissions: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
    }, {
        paranoid: true,
    });
}