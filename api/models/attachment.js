const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
        'Attachment',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            file_name: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },
            mime_type: {
                type: DataTypes.STRING(255),
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
        },
        {
            paranoid: true,
        },
    )
}

module.exports.associate = (Attachment, models) => {
    Attachment.belongsTo(models.Comment, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    })

    Attachment.belongsTo(models.User, {
        foreignKey: {
            name: 'updated_by',
        },
    })

    return Attachment
}
