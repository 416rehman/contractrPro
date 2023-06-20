const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Attachment = sequelize.define('Attachment', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        filename: {
            type: DataTypes.STRING(256),
            allowNull: false,
        },
        mimetype: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        fileSizeKb: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        accessUrl: {
            type: DataTypes.STRING(2048),
            allowNull: false,
        },
    })

    Attachment.associate = (models) => {
        Attachment.belongsTo(models.Comment, {
            foreignKey: {
                allowNull: false,
            },
            onDelete: 'CASCADE',
        })

        Attachment.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return Attachment
}
