module.exports.contract = (sequelize, DataTypes) => {
    return sequelize.define(
        'Contract',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING(1024),
                allowNull: false,
            },
            bill_to: {
                type: DataTypes.STRING(510),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(24),
                allowNull: false,
            },
            organization_id: {
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
