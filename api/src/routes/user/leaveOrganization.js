const { sequelize, Organization, User } = require('../../../db')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

module.exports = async (req, res) => {
    try {
        const userID = req.params.user_id
        const organizationID = req.params.org_id

        if (!userID) {
            return res
                .status(400)
                .json(createErrorResponse('User ID is required'))
        }

        if (!organizationID) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        if (userID !== req.auth.id) {
            return res
                .status(403)
                .json(
                    createErrorResponse(
                        'You can only leave your own organization'
                    )
                )
        }

        await sequelize.transaction(async (transaction) => {
            const user = await User.findOne({
                where: {
                    id: userID,
                },
                transaction,
            })

            if (!user) {
                return res
                    .status(404)
                    .json(createErrorResponse('User not found'))
            }

            const organization = await Organization.findOne({
                where: {
                    id: organizationID,
                },
                transaction,
            })

            if (!organization) {
                return res
                    .status(404)
                    .json(createErrorResponse('Organization not found'))
            }

            await user.removeOrganization(organization, { transaction })

            return res
                .status(200)
                .json(createSuccessResponse('Leave organization successfully'))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
