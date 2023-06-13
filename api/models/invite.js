module.exports.invite = (sequelize, DataTypes) => {
    return sequelize.define('Invite', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(12),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("active", "inactive"),
            defaultValue: "active",
            allowNull: false
        },
        uses: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        use_limit: {
            type: DataTypes.INTEGER,
            defaultValue: 0,    // 0 = unlimited
            allowNull: false
        },
        created_by: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        organization_id: {
            type: DataTypes.BIGINT,
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