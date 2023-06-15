const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const Member = sequelize.define(
        'Member', // a member is someone that is part of an organization
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            full_name: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            phone: {
                type: DataTypes.STRING(25),
                allowNull: false,
                unique: true,
            },
            permissions: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            paranoid: true,
        }
    )

    Member.associate = (models) => {
        Member.belongsTo(models.User)
        Member.belongsTo(models.Organization)

        Member.belongsTo(models.User, {
            foreignKey: {
                name: 'updated_by',
            },
        })
    }

    return Member
}
