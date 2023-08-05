const { User } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

//Retrieve user by id

module.exports = async (req, res) => {
    try {
        const id = req.params.user_id

        if (!id) {
            return res
                .status(400)
                .json(createErrorResponse('user id is required'))
        }

        //since user has unique id, it only return 1 user object
        const user = await User.findAll({
            where: {
                id:
                    id === 'me' || id === '@me' || id === '@'
                        ? req.auth.id
                        : id,
            },
            attributes: [
                'id',
                'username',
                'name',
                'flags',
                'createdAt',
                'updatedAt',
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
