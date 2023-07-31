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
        Comment.belongsTo(models.Organization, {
            //OrganizationId - Organization is ALWAYS set
            onDelete: 'CASCADE',
            foreignKey: { allowNull: false },
        })
        Comment.belongsTo(models.Contract, { onDelete: 'CASCADE' }) //ContractId
        Comment.belongsTo(models.Expense, { onDelete: 'CASCADE' }) //ExpenseId
        Comment.belongsTo(models.Invoice, { onDelete: 'CASCADE' }) //InvoiceId
        Comment.belongsTo(models.Client, { onDelete: 'CASCADE' }) //ClientId
        Comment.belongsTo(models.Vendor, { onDelete: 'CASCADE' }) //ProjectId

        Comment.hasMany(models.Attachment, {
            // CommentId - the metadata for the attachments of this comment
            foreignKey: { allowNull: false },
            onDelete: 'CASCADE',
        })

        Comment.belongsTo(models.User, {
            as: 'Author',
        })

        Comment.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })
    }

    return Comment
}