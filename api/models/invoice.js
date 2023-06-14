module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
        'Invoice',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            note: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            contract_id: {
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
