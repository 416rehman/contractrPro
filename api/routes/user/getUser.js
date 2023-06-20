const { User } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

//Retrieve user by id

module.exports = async (req, res) => {
    try {
        const userId = req.params.user_id

        if (!userId) {
            return res
                .status(400)
                .json(createErrorResponse('user id is required'))
        }

        //since user has unique id, it only return 1 user object
        const user = await User.findAll({
            where: { id: userId },
        })

        if (!user) {
            return res.status(404).json(createErrorResponse('User not found'))
        }

        res.status(200).json(createSuccessResponse(user))
    } catch (err) {
        res.status(500).json(createErrorResponse(err.message, err))
    }
}
