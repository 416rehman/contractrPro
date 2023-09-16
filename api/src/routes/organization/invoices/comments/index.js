const attachmentsMiddleware = require('../../../../middleware/attachmentsMiddleware')
const routes = require('express').Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/invoices/:invoice_id/comments Get organization invoice comments
 */
routes.get('/', require('./getComments'))

/**
 * @api {post} /organizations/:org_id/invoices/:invoice_id/comments Add to organization invoice
 */
routes.post('/', attachmentsMiddleware, require('./createComment'))

/**
 * @api {put} /organizations/:org_id/invoices/:invoice_id/comments/:comment_id Update organization invoice comment
 */
routes.put('/:comment_id', attachmentsMiddleware, require('./updateComment'))

/**
 * @api {delete} /organizations/:org_id/invoices/:invoice_id/comments/:comment_id Remove from organization invoice
 */
routes.delete('/:comment_id', require('./deleteComment'))

/**
 * @api {use} /organizations/:org_id/invoices/:invoice_id/comments/:comment_id/attachments Comment attachments
 */
routes.use('/:comment_id/attachments', require('./attachments'))

module.exports = routes
