const auth_service = require('../../utils/authHelpers')
module.exports = (req, res) => {
    auth_service
        .createUser(req.body)
        .then((user) => {
            res.json(user)
        })
        .catch((err) => {
            res.status(401).json(err.message)
        })
}
