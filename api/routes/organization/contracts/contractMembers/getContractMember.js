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

        const member = await OrganizationMember.findOne({
            where: {
                OrganizationId: orgId,
            },
            include: [
                {
                    model: Contract,
                    where: {
                        id: contractId,
                    },
                    required: true,
                },
            ],
        })

        if (!member) {
            return res
                .status(404)
                .json(createErrorResponse('Contract member not found'))
        }

        return res.status(200).json(createSuccessResponse(member))
    } catch (err) {
        console.error(err)
        return res
            .status(500)
            .json(createErrorResponse('Failed to get contract member'))
    }
}
