const { Sequelize } = require('sequelize')

module.exports.define = (sequelize, DataTypes) => {
    const Attachment = sequelize.define('Attachment', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(256),
            allowNull: false,
            // setter to limit the filename to 256 characters
            set(val) {
                this.setDataValue('name', val.substring(0, 256))
            },
        },
        type: {
            type: DataTypes.STRING(256),
            allowNull: false,
            // setter to limit the mimetype to 256 characters
            set(val) {
                this.setDataValue('type', val.substring(0, 256))
            },
        },
        size: {
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
            //CommentId
            foreignKey: { allowNull: false },
            onDelete: 'CASCADE',
        })
    }

    // after delete remove the file from S3
    Attachment.afterDestroy(async (attachment) => {
        const s3 = require('../../utils/s3')
        await s3.delete(attachment.id)
    })

    // Before bulk destroy, set individual hooks to true to run the afterDestroy hook even on bulk destroy
    Attachment.beforeBulkDestroy((options) => {
        options.individualHooks = true
    })

    return Attachment
}