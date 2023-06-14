module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
        'Comment',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            content: {
                type: DataTypes.STRING(1024),
                allowNull: false,
            },
            attachments: {
                type: DataTypes.STRING(1024),
                allowNull: false,
            },
            created_by: {
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
