const { sequelize, Contract, Job, OrganizationMember } = require('../../../db')
const { isValidUUID } = require('../../../utils/isValidUUID')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Gets the organization's contracts
module.exports = async (req, res) => {
    try {
        const expand = req.query.expand
        const orgID = req.params.org_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const options = {
                attributes: {
                    exclude: ['organization_id'],
                },
                where: {
                    OrganizationId: orgID,
                },
                transaction,
            }

            if (expand) {
                options.include = {
                    model: Job,
                    include: {
                        model: OrganizationMember,
                    },
                }
            }
            const organizationContracts = await Contract.findAll(options)
            for (let i = 0; i < organizationContracts?.length; i++) {
                // the jobs
                for (
                    let j = 0;
                    j < organizationContracts[i].Jobs?.length;
                    j++
                ) {
                    organizationContracts[i].Jobs[j].dataValues.JobMembers =
                        organizationContracts[i].Jobs[
                            j
                        ].OrganizationMembers.map(
                            (orgMember) => orgMember.JobMember
                        )
                    organizationContracts[i].Jobs[j].dataValues.assignedTo =
                        organizationContracts[i].Jobs[
                            j
                        ].dataValues.JobMembers.map(
                            (m) => m.OrganizationMemberId
                        )

                    delete organizationContracts[i].Jobs[j].dataValues
                        .OrganizationMembers
                }
            }

            return res
                .status(200)
                .json(createSuccessResponse(organizationContracts))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse('', error))
    }
}