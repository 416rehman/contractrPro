module.exports.organization = (sequelize, DataTypes) => {
    return sequelize.define("Organization", {
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(25),
            allowNull: false
        },
        website: DataTypes.STRING(255),
        logo: DataTypes.STRING,
        owner_id: DataTypes.INTEGER,
    });
}