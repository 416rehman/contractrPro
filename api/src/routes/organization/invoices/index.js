const routes = require('express').Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/invoices Get organization invoices
 */
routes.get('/', require('./getInvoices'))

/**
 * @api {get} /organizations/:org_id/invoices/:invoice_id Get organization invoice
 */
routes.get('/:invoice_id', require('./getInvoice'))

/**
 * @api {post} /organizations/:org_id/invoices Add to organization
 */
routes.post('/', require('./createInvoice'))

/**
 * @api {put} /organizations/:org_id/invoices/:invoice_id Update organization invoice
 */
routes.put('/:invoice_id', require('./updateInvoice'))

/**
 * @api {delete} /organizations/:org_id/invoices/:invoice_id Remove from organization
 */
routes.delete('/:invoice_id', require('./deleteInvoice'))

/**
 * @api {use} /organizations/:org_id/invoices/:invoice_id/comments Invoice comments
 */
routes.use('/:invoice_id/comments', require('./comments'))

module.exports = routes