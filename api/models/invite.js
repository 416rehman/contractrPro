module.exports.invite = (sequelize, DataTypes) => {
    return sequelize.define('Invite', {
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
            type: DataTypes.INTEGER(),
            defaultValue: 0,
            allowNull: false
        },
        use_limit: {
            type: DataTypes.INTEGER(),
            defaultValue: 0,    // 0 = unlimited
            allowNull: false
        },
        created_by: DataTypes.INTEGER(),
        organization_id: DataTypes.INTEGER()
    });
}