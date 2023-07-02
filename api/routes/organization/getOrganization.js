const { Organization } = require('../../db')
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

        //since organization has unique ids, it only return 1 organization object
        const organizations = await Organization.findAll({
            where: { id: orgId },
        })

        //if no organization in record, error-not found
        if (!organizations) {
            return res.status(404).json(createErrorResponse('User not found'))
        }

        return res.status(200).json(createSuccessResponse(organizations))
    } catch (err) {
        return res.status(400).json(createErrorResponse(err.message))
    }
}
