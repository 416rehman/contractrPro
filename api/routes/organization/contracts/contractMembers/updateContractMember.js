const {
    sequelize,
    Contract,
    OrganizationMember,
    ContractMember,
} = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { isValidUUID } = require('../../../../utils/isValidUUID')
const { pick } = require('../../../../utils')

// Update Contract Member
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const memberId = req.params.member_id

        if (!isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract_id'))
        }

        if (!isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org_id'))
        }

        if (!isValidUUID(memberId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid member_id'))
        }

        const body = {
            ...pick(req.body, ['permissionOverwrites']),
            UpdatedByUserId: req.auth.id,
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

            const contractMember = await ContractMember.findOne({
                where: {
                    OrganizationMemberId: memberId,
                    ContractId: contractId,
                },
            })

            if (!contractMember) {
                return res
                    .status(404)
                    .json(createErrorResponse('Contract member not found'))
            }

            await contractMember.update(body, { transaction })

            return res
                .status(200)
                .json(createSuccessResponse('Contract member updated'))
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json(createErrorResponse('Server error'))
    }
}
