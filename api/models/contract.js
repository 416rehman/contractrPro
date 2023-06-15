const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Contract = sequelize.define(
        'Contract',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING(1024),
            },
            start_date: {
                type: DataTypes.DATE,
            },
            due_date: {
                type: DataTypes.DATE,
            },
            completion_date: {
                type: DataTypes.DATE,
            },
            status: {
                // 0 = draft, 1 = active, 2 = completed, 3 = cancelled
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            paranoid: true,
        }
    )

    Contract.associate = (models) => {
        Contract.belongsTo(models.Organization, { onDelete: 'CASCADE' })
        Contract.belongsTo(models.Client)

        Contract.belongsTo(models.User, {
            foreignKey: {
                name: 'updated_by',
            },
        })
    }

    return Contract
}
