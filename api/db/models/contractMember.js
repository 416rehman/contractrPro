const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const ContractMember = sequelize.define(
        'ContractMember', // A contract member is a member that has access to a contract
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            permissionOverwrites: {
                type: DataTypes.BIGINT,
            },
        }
    )

    ContractMember.associate = (models) => {
        ContractMember.belongsToMany(models.Job, {
            through: 'JobMember',
        })

        ContractMember.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })
    }

    return ContractMember
}
