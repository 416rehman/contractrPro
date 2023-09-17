const prisma = require('../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

//retrieve organization by id
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id

        //check orgId input
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization id is required'))
        }

        const organization = await prisma.organization.findUnique({
            where: { id: orgId },
        })

        //if no organization in record, error-not found
        if (!organization) {
            return res
                .status(404)
                .json(createErrorResponse('Invalid Organization Id'))
        }

        return res.status(200).json(createSuccessResponse(organization))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}