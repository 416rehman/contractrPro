module.exports.user = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            full_name: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            phone: {
                type: DataTypes.STRING(25),
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            avatar: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            refresh_token: {
                type: DataTypes.STRING(255),
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

    return User
}
