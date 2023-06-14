module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
        'Organization',
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
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(25),
                allowNull: false,
            },
            website: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            logo: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            owner_id: {
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
