const prisma = require('../../../prisma')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Gets the organization's contract by ID
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id

        const contractID = req.params.contract_id

        if (!contractID) throw new Error('Contract ID is required')

        const contract = await prisma.contract.findUnique({
            where: {
                id: contractID,
                organizationId: orgID,
            },
        })

        if (!contract) throw new Error('Contract not found')

        return res.status(200).json(createSuccessResponse(contract))
    } catch (error) {
        res.status(500).json(createErrorResponse('', error))
    }
}