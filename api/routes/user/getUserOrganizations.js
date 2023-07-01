const { sequelize, Organization, User } = require('../../db')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

const { isValidUUID } = require('../../utils/isValidUUID')

// Gets a user's organization
module.exports = async (req, res) => {
    try {
        const userID = req.params.user_id

        if (!userID || !isValidUUID(userID)) {
            return res.status(400).json(createErrorResponse('User ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const userOrganizations = await User.findOne({
                attributes: {
                    exclude: [
                        'username',
                        'name',
                        'email',
                        'phone',
                        'password',
                        'avatarUrl',
                        'refreshToken',
                        'createdAt',
                        'updatedAt',
                        'deletedAt',
                        'updatedByUserId',
                    ],
                },
                where: {
                    id: userID,
                },
                include: {
                    model: Organization,
                },
                transaction,
            })

            if (!userOrganizations) {
                return res
                    .status(400)
                    .json(createErrorResponse('User not found'))
            }

            return res
                .status(200)
                .json(createSuccessResponse(userOrganizations))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse(error.message))
    }
}
