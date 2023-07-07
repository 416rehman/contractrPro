const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const OrganizationMember = sequelize.define(
        'OrganizationMember',
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: 'organizationConstraint', // Set unique constraint per organization
            },
            phone: {
                type: DataTypes.STRING(25),
                allowNull: false,
                unique: 'organizationConstraint', // Set unique constraint per organization
            },
            permissions: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['OrganizationId', 'email'], // Create index for uniqueness per organization and email
                },
                {
                    unique: true,
                    fields: ['OrganizationId', 'phone'], // Create index for uniqueness per organization and phone
                },
            ],
        }
    )

    OrganizationMember.associate = (models) => {
        OrganizationMember.belongsToMany(models.Contract, {
            through: models.ContractMember,
        })

        OrganizationMember.belongsToMany(models.Job, {
            through: models.JobMember,
        })

        OrganizationMember.belongsTo(models.User, {
            as: 'UpdatedByUser',
        })
    }

    return OrganizationMember
}
