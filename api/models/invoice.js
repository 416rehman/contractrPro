const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Invoice = sequelize.define(
        'Invoice',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            note: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
        },
        {
            paranoid: true,
        },
    )

    Invoice.associate = (models) => {
        // An invoice can either be for a contract or a job
        Invoice.belongsTo(models.Contract, {
            foreignKey: {
                allowNull: false,
            },
        })
        Invoice.belongsTo(models.Job)

        Invoice.belongsTo(models.User, {
            foreignKey: {
                name: 'updated_by',
            },
        })
    }

    return Invoice
}
