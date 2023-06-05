const {Comment} = require('./comment');

module.exports.attachment = (sequelize, DataTypes) => {
    return sequelize.define("Attachment", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        comment: {
            type: DataTypes.STRING,
            references: {
                model: Comment,
                key: 'id'
            },
            allowNull: false
        },
        file_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        file_type: {
            type: DataTypes.STRING,
            allowNull: false
        }, 
        file_size_kb: {
            type: DataTypes.BIGINT,
            allowNull: false
        }, 
        access_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
}