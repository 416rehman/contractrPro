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
            permission_overwrites: {
                type: DataTypes.BIGINT,
            },
        },
        {
            paranoid: true,
        }
    )

    ContractMember.associate = (models) => {
        ContractMember.belongsTo(models.Contract)
        ContractMember.belongsTo(models.Member)

        ContractMember.belongsTo(models.User, {
            foreignKey: {
                name: 'updated_by',
            },
        })
    }

    return ContractMember
}
