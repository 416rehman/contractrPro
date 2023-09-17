const prisma = require('../../../prisma')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Gets the organization's contract by ID
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id

        const contracts = await prisma.contract.findMany({
            where: {
                organizationId: orgID,
            },
        })

        if (!contracts) throw new Error('Contracts not found')

        return res.status(200).json(createSuccessResponse(contracts))
    } catch (error) {
        res.status(500).json(createErrorResponse('', error))
    }
}