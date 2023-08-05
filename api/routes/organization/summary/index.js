const routes = require('express').Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/vendors Get organization vendors
 */
routes.get('/', require('./getSummary'))

module.exports = routes
