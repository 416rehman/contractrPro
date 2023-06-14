module.exports.attachment = (sequelize, DataTypes) => {
  return sequelize.define(
    "Attachment",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      comments: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      file_name: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      file_type: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      file_size_kb: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      access_url: {
        type: DataTypes.STRING(2048),
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
  );
};
