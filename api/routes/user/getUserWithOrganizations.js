const {
    sequelize,
    Organization,
    OrganizationSettings,
    User,
    Address,
} = require('../../db')

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

        if (req.auth.id !== userID) {
            return res
                .status(401)
                .json(createErrorResponse('Unauthorized access'))
        }

        await sequelize.transaction(async (transaction) => {
            const userOrganizations = await User.findOne({
                attributes: {
                    exclude: [
                        'password',
                        'refreshToken',
                        'deletedAt',
                        'UpdatedByUserId',
                    ],
                },
                where: {
                    id: userID,
                },
                include: [
                    {
                        model: Organization,
                        include: [
                            { model: OrganizationSettings },
                            { model: Address },
                        ],
                    },
                ],
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
        res.status(400).json(createErrorResponse('', error))
    }
}