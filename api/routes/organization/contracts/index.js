const routes = require('express').Router({ mergeParams: true })
const job_routes = require('./jobs')

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/ Get all contracts by organization
 */
routes.get('/', require('./getContracts'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id Get organization contract by id
 */
routes.get('/:contract_id', require('./getContractById'))

/**
 * @api {post} /organizations/:org_id/contracts/ Create organization contract
 */
routes.post('/', require('./createContract'))

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id Update organization contract
 */
routes.put('/:contract_id', require('./updateContract'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id Delete organization contract
 */
routes.delete('/:contract_id', require('./deleteContract'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/expenses Get all contract expenses by contract
 */
routes.get('/:contract_id/expenses', require('./getExpensesByContract'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/expenses/:expense_id Get contract expense by id
 */
routes.get(
    '/:contract_id/expenses/:expense_id',
    require('./getContractExpenseById')
)

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/expenses Create contract expense
 */
routes.post('/:contract_id/expenses', require('./createContractExpense'))

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/expenses/:expense_id Update contract expense
 */
routes.put(
    '/:contract_id/expenses/:expense_id',
    require('./updateContractExpense')
)

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/expenses/:expense_id Delete contract expense
 */
routes.delete(
    '/:contract_id/expenses/:expense_id',
    require('./deleteContractExpense')
)

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/invoices Get all invoices by contract
 */
routes.get('/:contract_id/invoices', require('./getInvoicesByContract'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id Get contract invoice by id
 */
routes.get(
    '/:contract_id/invoices/:invoice_id',
    require('./getContractInvoiceById')
)

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/invoices Create contract invoice
 */
routes.post('/:contract_id/invoices', require('./createContractInvoice'))

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id Update contract invoice
 */
routes.put(
    '/:contract_id/invoices/:invoice_id',
    require('./updateContractInvoice')
)

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id Delete contract invoice
 */
routes.delete(
    '/:contract_id/invoices/:invoice_id',
    require('./deleteContractInvoice')
)

/*####################################Entry Routes####################################################*/
/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id
 */
routes.post('/:contract_id/invoices/:invoice_id/invoiceEntries', require('./createInvoiceEntry'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id/invoiceEntries/:invoiceEntry_id  Delete invoice invoiceEntry
 */
routes.delete(
    '/:contract_id/invoices/:invoice_id/invoiceEntries/:invoiceEntry_id',
    require('./deleteInvoiceEntry')
)



/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/expenses/:expense_id/expenseEntries Create contract expense
 */
routes.post('/:contract_id/expenses/:expense_id/expenseEntries', require('./createExpenseEntry'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/expenses/:expense_id/expenseEntries/:expenseEntry_id  Delete expense expenseEntry
 */
routes.delete(
    '/:contract_id/expenses/:expense_id/:expense_id/expenseEntries/:expenseEntry_id',
    require('./deleteExpenseEntry')
)
/*####################################Entry Routes END####################################################*/



/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs Get all jobs by contract
 * @type {Router}
 */
routes.use('/:contract_id/jobs', job_routes)
module.exports = routes
