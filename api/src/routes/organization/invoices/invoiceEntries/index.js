const routes = require('express').Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/invoices/:invoice_id/entries Get organization invoice entries
 */
routes.get('/', require('./getInvoiceEntries'))

/**
 * @api {get} /organizations/:org_id/invoices/:invoice_id/entries/:entry_id Get organization invoice entry
 */
routes.get('/:entry_id', require('./getInvoiceEntry'))

/**
 * @api {post} /organizations/:org_id/invoices/:invoice_id/entries Add to organization
 */
routes.post('/', require('./createInvoiceEntry'))

/**
 * @api {put} /organizations/:org_id/invoices/:invoice_id/entries/:entry_id Update organization invoice entry
 */
routes.put('/:entry_id', require('./updateInvoiceEntry'))

/**
 * @api {delete} /organizations/:org_id/invoices/:invoice_id/entries/:entry_id Remove from organization
 */
routes.delete('/:entry_id', require('./deleteInvoiceEntry'))

module.exports = routes
