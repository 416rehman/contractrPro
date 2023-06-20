const { sequelize, Organization } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
// Creates an organization
module.exports = async (req, res) => {
    try {
        const body = {
            ...req.body,
            ownerId: req.auth.id,
            updatedByUserId: req.auth.id,
        }

        await sequelize.transaction(async (transaction) => {
            const org = await Organization.create(body, {
                transaction,
            })

            res.status(201).json(createSuccessResponse(org))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse(error.message))
    }
}
