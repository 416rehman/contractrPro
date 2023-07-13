const { User } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

//Retrieve user by id

module.exports = async (req, res) => {
    try {
        //since user has unique id, it only return 1 user object
        const user = await User.findAll({
            where: {
                id: req.auth.id,
            },
            attributes: [
                'id',
                'username',
                'email',
                'name',
                'flags',
                'createdAt',
                'updatedAt',
                'phone',
                'avatarUrl',
            ],
        })

        if (!user) {
            return res.status(404).json(createErrorResponse('User not found'))
        }

        return res.status(200).json(createSuccessResponse(user))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}