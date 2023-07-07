const { sequelize, Contract, OrganizationMember } = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { isValidUUID } = require('../../../../utils/isValidUUID')
const { pick } = require('../../../../utils')

// Create Contract Member
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const memberId = req.body.OrganizationMemberId

        if (!isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract_id'))
        }

        if (!isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org_id'))
        }

        const body = {
            ...pick(req.body, ['permissions']),
        }

        await sequelize.transaction(async (transaction) => {
            const organizationMember = await OrganizationMember.findOne({
                where: {
                    id: memberId,
                    OrganizationId: orgId,
                },
            })

            if (!organizationMember) {
                return res
                    .status(404)
                    .json(createErrorResponse('Organization member not found'))
            }

            const contract = await Contract.findOne({
                where: {
                    id: contractId,
                    OrganizationId: orgId,
                },
            })

            if (!contract) {
                return res
                    .status(404)
                    .json(createErrorResponse('Contract not found'))
            }

            const result = await contract.addOrganizationMember(
                organizationMember,
                {
                    through: body,
                    transaction,
                }
            )

            return res.status(200).json(createSuccessResponse(result))
        })
    } catch (err) {
        return res.status(500).json(createErrorResponse(err))
    }
}
