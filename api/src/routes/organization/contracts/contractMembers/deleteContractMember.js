const { Contract, OrganizationMember } = require('../../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// Delete Contract Member
module.exports = async (req, res) => {
    const orgId = req.params.org_id
    const contractId = req.params.contract_id
    const memberId = req.params.member_id

    if (!isValidUUID(contractId)) {
        return res.status(400).json(createErrorResponse('Invalid contract_id'))
    }

    if (!isValidUUID(memberId)) {
        return res.status(400).json(createErrorResponse('Invalid member_id'))
    }

    if (!isValidUUID(orgId)) {
        return res.status(400).json(createErrorResponse('Invalid org_id'))
    }

    try {
        const contractMember = await OrganizationMember.findOne({
            where: {
                id: memberId,
                OrganizationId: orgId,
            },
        })

        if (!contractMember) {
            return res
                .status(404)
                .json(createErrorResponse('Contract member not found'))
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

        await contract.removeOrganizationMember(contractMember)

        return res
            .status(200)
            .json(createSuccessResponse('Contract member deleted'))
    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Failed to delete contract member'))
    }
}
