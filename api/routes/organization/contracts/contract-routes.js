const contract_service = require('../../../services/contract-service')
const routes = require('express').Router({mergeParams: true })
const job_routes = require('./jobs/job-routes')

routes.use((req, res, next) => {
    const path = (__filename.split('/').slice(-1)[0]).split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/ Get all contracts by organization
 */
routes.get('/', (req, res) => {
    contract_service.ping(req, res)
});

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id Get organization contract by id
 */
routes.get('/:contract_id', (req, res) => {
    contract_service.getContractById(req, res)
});

/**
 * @api {post} /organizations/:org_id/contracts/ Create organization contract
 */
routes.post('/', (req, res) => {
    contract_service.createContract(req, res)
});

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id Update organization contract
 */
routes.put('/:contract_id', (req, res) => {
    contract_service.updateContract(req, res)
});

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id Delete organization contract
 */
routes.delete('/:contract_id', (req, res) => {
    contract_service.deleteContract(req, res)
});

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/expenses Get all contract expenses by contract
 */
routes.get('/:contract_id/expenses', (req, res) => {
    contract_service.getExpensesByContract(req, res)
});

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/expenses/:expense_id Get contract expense by id
 */
routes.get('/:contract_id/expenses/:expense_id', (req, res) => {
    contract_service.getExpenseById(req, res)
});

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/expenses Create contract expense
 */
routes.post('/:contract_id/expenses', (req, res) => {
    contract_service.createExpense(req, res)
});

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/expenses/:expense_id Update contract expense
 */
routes.put('/:contract_id/expenses/:expense_id', (req, res) => {
    contract_service.updateExpense(req, res)
});

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/expenses/:expense_id Delete contract expense
 */
routes.delete('/:contract_id/expenses/:expense_id', (req, res) => {
    contract_service.deleteExpense(req, res)
});

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/invoices Get all invoices by contract
 */
routes.get('/:contract_id/invoices', (req, res) => {
    contract_service.getInvoicesByContract(req, res)
});

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id Get contract invoice by id
 */
routes.get('/:contract_id/invoices/:invoice_id', (req, res) => {
    contract_service.getInvoiceById(req, res)
});

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/invoices Create contract invoice
 */
routes.post('/:contract_id/invoices', (req, res) => {
    contract_service.createInvoice(req, res)
});

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id Update contract invoice
 */
routes.put('/:contract_id/invoices/:invoice_id', (req, res) => {
    contract_service.updateInvoice(req, res)
});

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id Delete contract invoice
 */
routes.delete('/:contract_id/invoices/:invoice_id', (req, res) => {
    contract_service.deleteInvoice(req, res)
});


/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs Get all jobs by contract
 * @type {Router}
 */
routes.use('/:contract_id/jobs', job_routes)
module.exports = routes;