const { Sequelize } = require('sequelize')

module.exports.define = (sequelize, DataTypes) => {
    const Job = sequelize.define('Job', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        reference: {
            // Custom reference number for the job
            type: DataTypes.STRING(256),
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING(256),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(512),
            allowNull: true,
        },
        status: {
            // 0 = open, 1 = in progress, 2 = completed, 3 = cancelled
            type: DataTypes.SMALLINT,
            defaultValue: 0,
        },
        startDate: {
            // Date the job is scheduled to start
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        dueDate: {
            // Date the job is scheduled to end - if null, uses the project's due date
            type: DataTypes.DATE,
        },
        completionDate: {
            // Date the job was completed
            type: DataTypes.DATE,
        },
        totalCost: {
            // Total cost of the job
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
    })

    Job.associate = (models) => {
        Job.belongsTo(models.Contract, { onDelete: 'CASCADE' })
        Job.belongsToMany(models.OrganizationMember, {
            through: models.JobMember,
        })

        Job.hasMany(models.Expense)
        Job.hasMany(models.Invoice)

        Job.hasMany(models.Comment, {
            onDelete: 'CASCADE',
        })

        Job.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })
    }

    return Job
}
