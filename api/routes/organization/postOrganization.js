const { sequelize, Organization } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const {pick} = require("../../utils");

// Creates an organization
module.exports = async (req, res) => {
    try {
        const body = {
            ...pick(req.body, ['name', 'description', 'email', 'phone', 'website', 'logoUrl']),
            ownerId: req.auth.id,
            updatedByUserId: req.auth.id,
        }

        await sequelize.transaction(async (transaction) => {
            const org = await Organization.create(body, {
                transaction,
            })

            return res.status(201).json(createSuccessResponse(org))
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
