const { User } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

// Retrieves all users
module.exports = async (req, res) => {
    try {
        const users = await User.findAll()

        //if no user in organization at all, return empty array
        if (!users) {
            return []
        }
        res.status(200).json(createSuccessResponse(users))
    } catch (err) {
        res.status(500).json(createErrorResponse(err.message, err))
    }
}
