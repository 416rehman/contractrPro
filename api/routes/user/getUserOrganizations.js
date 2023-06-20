const { sequelize, Organization, User } = require('../../db')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

// Gets a user's organizations
module.exports = async (req, res) => {
    try {
        const userID = req.params.user_id

        if (!userID) {
            return res
                .status(400)
                .json(createErrorResponse('User ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const userOrganizations = await User.findAll({
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

            return res
                .status(200)
                .json(createSuccessResponse(userOrganizations))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse(error.message, error))
    }
}
