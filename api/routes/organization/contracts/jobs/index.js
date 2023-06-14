const routes = require('express').Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs Get all organization contract jobs
 */
routes.get('/', require('./getJobs'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Get organization contract job
 */
routes.get('/:job_id', require('./getJob'))

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs Create organization contract job
 */
routes.post('/', require('./postJob'))

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Update organization contract job
 */
routes.put('/:job_id', require('./putJob'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Delete organization contract job
 */
routes.delete('/:job_id', require('./deleteJob'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Get organization contract job members
 **/
routes.get('/:job_id/members', require('./getJobMembers'))

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Add member to organization contract job
 **/
routes.post('/:job_id/members', require('./postJobMember'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Remove member from organization contract job
 */
routes.delete('/:job_id/members/:member_id', require('./deleteJobMember'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/expenses Get all job expenses for all jobs in this contract
 */
routes.get('/expenses', require('./getExpensesForAllJobs'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/expenses/:job_id Get all job expenses for this job
 */

routes.get('/expenses/:job_id', require('./getExpensesForJob'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/expenses/:job_id/:expense_id Get job expense
 */
routes.get('/expenses/:job_id/:expense_id', require('./getJobExpense'))

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs/expenses Create job expense
 */
routes.post('/expenses', require('./postJobExpense'))

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/jobs/expenses/:job_id Update job expense
 */
routes.put('/expenses/:job_id', require('./putJobExpense'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/expenses/:job_id Delete job expense
 */
routes.delete('/expenses/:job_id', require('./deleteJobExpense'))

module.exports = routes
