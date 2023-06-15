const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
        'Comment',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            content: {
                type: DataTypes.STRING(1024),
                allowNull: false,
            },
            attachments: {
                type: DataTypes.STRING(1024),
                allowNull: false,
            },
        },
        {
            paranoid: true,
        },
    )
}

module.exports.associate = (Comment, models) => {
    Comment.belongsTo(models.Contract, { onDelete: 'CASCADE' })
    Comment.belongsTo(models.Job, { onDelete: 'CASCADE' })
    Comment.belongsTo(models.Expense, { onDelete: 'CASCADE' })
    Comment.belongsTo(models.Invoice, { onDelete: 'CASCADE' })

    Comment.belongsTo(models.User, {    // If no author is specified, it is a system message
        foreignKey: {
            name: 'author_id',
        },
    })

    Comment.belongsTo(models.User, {
        foreignKey: {
            name: 'updated_by',
        },
    })

    return Comment
}
