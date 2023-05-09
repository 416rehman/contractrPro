module.exports.address = (sequelize, DataTypes) => {
    return sequelize.define("Address", {
        country: DataTypes.STRING(100),
        postal_code: DataTypes.STRING(10),
        province: DataTypes.STRING(100),
        city: DataTypes.STRING(100),
        address_line_1: DataTypes.STRING(100),
        address_line_2: DataTypes.STRING(100),
    });
}