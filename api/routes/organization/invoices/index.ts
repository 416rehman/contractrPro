import getInvoices from './getInvoices';
import getInvoice from './getInvoice';
import createInvoice from './createInvoice';
import updateInvoice from './updateInvoice';
import deleteInvoice from './deleteInvoice';
import invoiceEntries from './invoiceEntries';
import comments from './comments';
import { Router } from 'express';
const routes = Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/invoices Get organization invoices
 */
routes.get('/', getInvoices)

/**
 * @api {get} /organizations/:org_id/invoices/:invoice_id Get organization invoice
 */
routes.get('/:invoice_id', getInvoice)

/**
 * @api {post} /organizations/:org_id/invoices Add to organization
 */
routes.post('/', createInvoice)

/**
 * @api {put} /organizations/:org_id/invoices/:invoice_id Update organization invoice
 */
routes.put('/:invoice_id', updateInvoice)

/**
 * @api {delete} /organizations/:org_id/invoices/:invoice_id Remove from organization
 */
routes.delete('/:invoice_id', deleteInvoice)

/**
 * @api {use} /organizations/:org_id/invoices/:invoice_id/entries Invoice entries
 */
routes.use('/:invoice_id/entries', invoiceEntries)

/**
 * @api {use} /organizations/:org_id/invoices/:invoice_id/comments Invoice comments
 */
routes.use('/:invoice_id/comments', comments)

export default routes
