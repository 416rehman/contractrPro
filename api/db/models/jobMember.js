const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const JobMember = sequelize.define('JobMember', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        permissionOverwrites: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    })

    JobMember.associate = (models) => {
        JobMember.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })
    }

    return JobMember
}
