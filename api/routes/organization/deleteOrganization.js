const { Organization } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

module.exports = async (req, res) => {
    try {
        const org_id = req.params.org_id
        const organization = await Organization.findByIdAndDelete(org_id)

        if (!organization) {
            return res.status(404).send({
                message: `Organization with ID ${org_id} was not found`,
            })
        }

        return res.status(200).json(createSuccessResponse(organization))
    } catch (error) {
        return res.status(400).json(createErrorResponse(error.message))
    }
}
