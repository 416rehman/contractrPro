const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Invite = sequelize.define(
        'Invite',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            code: {
                type: DataTypes.STRING(8),
                allowNull: false,
            },
            uses: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            max_uses: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
        },
        {
            paranoid: true,
        },
    )

    Invite.associate = (models) => {
        // The organization that the invite is for
        Invite.belongsTo(models.Organization, {
            foreignKey: 'organization_id',
            allowNull: false,
            onDelete: 'CASCADE',
        })

        // The user that created the invite
        Invite.belongsTo(models.User, {
            foreignKey: 'created_by',
        })

        Invite.belongsTo(models.User, {
            foreignKey: {
                name: 'updated_by',
            },
        })
    }


    return Invite
}
