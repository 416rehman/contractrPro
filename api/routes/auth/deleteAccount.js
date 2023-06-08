const {deleteUser} = require("../../utils/authHelpers");
module.exports = (req, res) => {
    deleteUser(req.auth.username).then(user => {
        res.json(user)
    }).catch(err => {
        res.status(401).json(err.message)
    })
}
