const auth_service = require('../../utils/authHelpers')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
module.exports = async (req, res) => {
    try {
        const user = await auth_service.createUser(req.body)
        // remove password from response
        delete user.dataValues.password
        res.status(201).json(createSuccessResponse(user))
    } catch (err) {
        res.status(400).json(createErrorResponse(err.message))
    }
}
