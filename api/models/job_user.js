module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
        'Job_Users',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            contract_user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            job_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            permission_overwrites: {
                type: DataTypes.INTEGER,
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
