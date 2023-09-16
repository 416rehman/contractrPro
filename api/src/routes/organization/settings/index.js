const routes = require('express').Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/settings Get organization settings
 */
routes.get('/', require('./getSettings'))

/**
 * @api {put} /organizations/:org_id/settings Update organization settings
 */
routes.put('/', require('./updateSettings'))

module.exports = routes
