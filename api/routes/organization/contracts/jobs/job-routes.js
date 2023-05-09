const job_service = require('../../../../services/job-service')
const routes = require('express').Router({mergeParams: true })

routes.use((req, res, next) => {
    const path = (__filename.split('/').slice(-1)[0]).split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs Get all organization contract jobs
 */
routes.get('/', (req, res) => {
    job_service.ping(req, res)
});

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Get organization contract job
 */
routes.get('/:job_id', (req, res) => {
    job_service.get(req, res)
});

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs Create organization contract job
 */
routes.post('/', (req, res) => {
    job_service.create(req, res)
});

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Update organization contract job
 */
routes.put('/:job_id', (req, res) => {
    job_service.update(req, res)
});

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Delete organization contract job
 */
routes.delete('/:job_id', (req, res) => {
    job_service.delete(req, res)
});

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Get organization contract job members
 **/
routes.get('/:job_id/members', (req, res) => {
    job_service.getMembers(req, res)
});

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Add member to organization contract job
 **/
routes.post('/:job_id/members', (req, res) => {
    job_service.addMember(req, res)
});

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Remove member from organization contract job
 */
routes.delete('/:job_id/members/:member_id', (req, res) => {
    job_service.removeMember(req, res)
});

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/expenses Get all job expenses for all jobs in this contract
 */
routes.get('/expenses', (req, res) => {
    job_service.getExpenses(req, res)
});

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/expenses/:job_id Get all job expenses for this job
 */

routes.get('/expenses/:job_id', (req, res) => {
    job_service.getExpensesForJob(req, res)
});

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs/expenses Create job expense
 */
routes.post('/expenses', (req, res) => {
    job_service.createExpense(req, res)
});

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/jobs/expenses/:job_id Update job expense
 */
routes.put('/expenses/:job_id', (req, res) => {
    job_service.updateExpense(req, res)
});

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/expenses/:job_id Delete job expense
 */
routes.delete('/expenses/:job_id', (req, res) => {
    job_service.deleteExpense(req, res)
});

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/expenses/:job_id/:expense_id Get job expense
 */
routes.get('/expenses/:job_id/:expense_id', (req, res) => {
    job_service.getExpense(req, res)
});

module.exports = routes;