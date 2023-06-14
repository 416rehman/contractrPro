module.exports.address = (sequelize, DataTypes) => {
  return sequelize.define(
    "Address",
    {
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      postal_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      province: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      address_line_1: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      address_line_2: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
};
