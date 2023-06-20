const { deleteUser } = require('../../utils/authHelpers')
const { createSuccessResponse, createErrorResponse } = require('../../utils/response')
module.exports = (req, res) => {
    deleteUser(req.auth.username)
        .then((user) => {
            res.json(createSuccessResponse(user))
        })
        .catch((err) => {
            res.status(401).json(createErrorResponse(err.message))
        })
}
