const { Sequelize } = require('sequelize')
const { DeleteObjectCommand } = require('@aws-sdk/client-s3')

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
            // setter to limit the filename to 256 characters
            set(val) {
                this.setDataValue('filename', val.substring(0, 256))
            },
        },
        mimetype: {
            type: DataTypes.STRING(256),
            allowNull: false,
            // setter to limit the mimetype to 256 characters
            set(val) {
                this.setDataValue('mimetype', val.substring(0, 256))
            },
        },
        fileSizeBytes: {
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
    Attachment.afterDestroy(async (attachment, options) => {
        const s3 = require('../../s3.config')
        await s3.send(
            {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: attachment.id,
            },
            DeleteObjectCommand
        )
    })

    // after bulk delete remove the files from S3
    Attachment.afterBulkDestroy(async (options) => {
        const s3 = require('../../s3.config')
        const attachmentIds = options.where.id[Sequelize.Op.in]
        for (const attachmentId of attachmentIds) {
            await s3.send(
                {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: attachmentId,
                },
                DeleteObjectCommand
            )
        }
    })

    return Attachment
}
