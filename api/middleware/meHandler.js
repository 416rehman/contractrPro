module.exports = (req, res, next) => {
    if (
        req.params.user_id === 'me' ||
        req.params.user_id === '@me' ||
        req.params.user_id === 'me/'
    ) {
        req.params.user_id = req.auth.id
    }
    next()
}
