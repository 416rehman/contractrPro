const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const JobMember = sequelize.define(
        'JobMember',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            permission_overwrites: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            paranoid: true,
        }
    )

    JobMember.associate = (models) => {
        JobMember.belongsTo(models.Member) // the member that is part of the job
        JobMember.belongsTo(models.Job) // the job that the member is part of

        JobMember.belongsTo(models.User, {
            foreignKey: {
                name: 'updated_by',
            },
        })
    }

    return JobMember
}
