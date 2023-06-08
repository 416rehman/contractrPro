
module.exports.user = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        full_name: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING(25),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        avatar: DataTypes.STRING,
        refresh_token: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
    });

    return User;
}
