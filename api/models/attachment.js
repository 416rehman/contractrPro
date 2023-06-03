const {comment} = require('./comment');

module.exports.attachment = (sequelize, DataTypes) => {
    return sequelize.define("Attachment", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        comment: {
            type: DataTypes.STRING,
            references: {
                model: comment,
                key: 'id'
            }
        },
        file_name: DataTypes.STRING,
        file_type: DataTypes.STRING,
        file_size_kb: DataTypes.BIGINT,
        access_url: DataTypes.STRING,
    });
}