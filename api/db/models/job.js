const { Sequelize } = require('sequelize')

module.exports.define = (sequelize, DataTypes) => {
    const Job = sequelize.define('Job', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        identifier: {
            // Custom identifier for the job
            type: DataTypes.STRING(256),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(256),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(512),
            allowNull: false,
        },
        status: {
            // 0 = open, 1 = in progress, 2 = completed, 3 = cancelled
            type: DataTypes.SMALLINT,
            defaultValue: 0,
        },
    })

    Job.associate = (models) => {
        Job.belongsTo(models.Contract, { onDelete: 'CASCADE' })
        Job.belongsToMany(models.ContractMember, {
            through: 'JobMember',
        })

        Job.hasMany(models.Expense)
        Job.hasMany(models.Invoice)

        Job.hasMany(models.Comment)

        Job.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })
    }

    return Job
}
