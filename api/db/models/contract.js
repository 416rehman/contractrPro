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
            startDate: {
                type: DataTypes.DATE,
            },
            dueDate: {
                type: DataTypes.DATE,
            },
            completionDate: {
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
        Contract.belongsTo(models.Organization, {
            onDelete: 'CASCADE',
            foreignKey: { allowNull: false },
        })
        Contract.belongsTo(models.Client, {
            onDelete: 'RESTRICT',
            foreignKey: { allowNull: false },
        })

        Contract.belongsToMany(models.OrganizationMember, {
            through: 'ContractMember',
        })

        Contract.hasMany(models.Expense)
        Contract.hasMany(models.Invoice)

        Contract.hasMany(models.Job, {
            foreignKey: { allowNull: false },
        })

        Contract.hasMany(models.Comment)

        Contract.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return Contract
}
