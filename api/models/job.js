const { Sequelize } = require('sequelize')

module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
        'Job',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            identifier: {   // Custom identifier for the job
                type: DataTypes.STRING(256),
                allowNull: false,
            },
            job_name: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            status: {   // 0 = open, 1 = in progress, 2 = completed, 3 = cancelled
                type: DataTypes.SMALLINT,
                defaultValue: 0,
            },
        },
        {
            paranoid: true,
        }
    )
}

module.exports.associate = (Job, models) => {
    Job.belongsTo(models.Contract, { onDelete: 'CASCADE' })

    Job.belongsTo(models.User, {
        foreignKey: {
                        name: 'updated_by',
        }
    })

    return Job
}
