const routes = require('express').Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/vendors Get organization vendors
 */
routes.get('/', require('./getVendors'))

/**
 * @api {get} /organizations/:org_id/vendors/:vendor_id Get organization vendor
 */
routes.get('/:vendor_id', require('./getVendor'))

/**
 * @api {post} /organizations/:org_id/vendors Add to organization
 */
routes.post('/', require('./createVendor'))

/**
 * @api {put} /organizations/:org_id/vendors/:vendor_id Update organization vendor
 */
routes.put('/:vendor_id', require('./updateVendor'))

/**
 * @api {delete} /organizations/:org_id/vendors/:vendor_id Remove from organization
 */
routes.delete('/:vendor_id', require('./deleteVendor'))

/**
 * @api {use} /organizations/:org_id/vendors/:vendor_id/comments Invoice comments
 */
routes.use('/:vendor_id/comments', require('./comments'))

module.exports = routes
