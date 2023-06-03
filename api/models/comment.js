const {attachment} = require('./attachment');

module.exports.comment = (sequelize, DataTypes) => {
    return sequelize.define("Comment", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        content: DataTypes.STRING,
        attachments: {
            type: DataTypes.STRING,
            references: {
                model: attachment,
                key: 'id'
            }
        },
        created_by: DataTypes.BIGINT,
    });
}