const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
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
    })

    Comment.associate = (models) => {
        Comment.belongsTo(models.Contract, { onDelete: 'CASCADE' })
        Comment.belongsTo(models.Job, { onDelete: 'CASCADE' })
        Comment.belongsTo(models.Expense, { onDelete: 'CASCADE' })
        Comment.belongsTo(models.Invoice, { onDelete: 'CASCADE' })

        Comment.belongsTo(models.User, {
            as: 'author',
        })

        Comment.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return Comment
}
