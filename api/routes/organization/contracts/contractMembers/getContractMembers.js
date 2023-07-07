const { Contract, OrganizationMember } = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// Get Contract Members
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract_id'))
        }

        if (!isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org_id'))
        }

        const members = await OrganizationMember.findAll({
            where: {
                OrganizationId: orgId,
            },
            include: [
                {
                    model: Contract,
                    where: {
                        id: contractId,
                        OrganizationId: orgId,
                    },
                    required: true,
                },
            ],
        })

        if (!members) {
            return res
                .status(404)
                .json(createErrorResponse('Contract members not found'))
        }

        return res.status(200).json(createSuccessResponse(members))
    } catch (err) {
        console.error(err)
        return res
            .status(500)
            .json(createErrorResponse('Failed to get contract members'))
    }
}
