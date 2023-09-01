const { OrganizationSettings } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

//retrieve organizationSettings by id
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id

        //check orgId input
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization id is required'))
        }

        // Get the organization settings
        const settings = await OrganizationSettings.findOne({
            where: { OrganizationId: orgId },
        })

        //if no organization in record, error-not found
        if (!settings) {
            return res
                .status(404)
                .json(createErrorResponse('Organization settings not found'))
        }

        return res.status(200).json(createSuccessResponse(settings))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}