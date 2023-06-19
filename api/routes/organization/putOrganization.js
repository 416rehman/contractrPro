const { Organization, sequelize } = require('../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../utils/response')

// Updates an organization
module.exports = async (req, res) => {
    try {
        const body = {
            ...req.body,
            updatedByUserId: req.auth.id,
        }

        const orgId = req.params.org_id
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization id is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const updatedOrg = await Organization.update(body, {
                where: {
                    id: orgId,
                },
                transaction,
                returning: true,
            })

            return res.status(200).json(createSuccessResponse(updatedOrg))
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message, error))
    }
}
