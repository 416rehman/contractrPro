const { Sequelize } = require('sequelize')
module.exports.define = (sequelize, DataTypes) => {
    const OrganizationMember = sequelize.define(
        'OrganizationMember', // a member is someone that is part of an organization
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
                validate: {
                    isUniquePerOrganization(value, next) {
                        const OrganizationMember =
                            sequelize.models.OrganizationMember
                        const orgId = this.getDataValue('OrganizationId')

                        OrganizationMember.findOne({
                            where: {
                                email: value,
                                OrganizationId: orgId,
                            },
                        })
                            .then((member) => {
                                if (member) {
                                    return next(
                                        `Email is already in use within the organization.`
                                    )
                                }
                                next()
                            })
                            .catch((err) => next(err))
                    },
                },
            },
            phone: {
                type: DataTypes.STRING(25),
                allowNull: false,
                validate: {
                    isUniquePerOrganization(value, next) {
                        const OrganizationMember =
                            sequelize.models.OrganizationMember
                        const orgId = this.getDataValue('OrganizationId')

                        OrganizationMember.findOne({
                            where: {
                                phone: value,
                                OrganizationId: orgId,
                            },
                        })
                            .then((member) => {
                                if (member) {
                                    return next(
                                        `Phone is already in use within the organization.`
                                    )
                                }
                                next()
                            })
                            .catch((err) => next(err))
                    },
                },
            },
            permissions: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
        }
    )

    OrganizationMember.associate = (models) => {
        OrganizationMember.belongsToMany(models.Contract, {
            through: 'ContractMember',
        })

        OrganizationMember.belongsTo(models.User, {
            as: 'updatedByUser',
        })
    }

    return OrganizationMember
}
