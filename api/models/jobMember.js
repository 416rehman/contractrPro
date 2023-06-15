const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    return sequelize.define(
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
}

module.exports.associate = (Job_Member, models) => {
    Job_Member.belongsTo(models.Member) // the member that is part of the job
    Job_Member.belongsTo(models.Job) // the job that the member is part of

    Job_Member.belongsTo(models.User, {
        foreignKey: {
            name: 'updated_by',
        },
    })

    return Job_Member
}
