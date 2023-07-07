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
routes.put('/:job_id', require('./updateJob'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Delete organization contract job
 */
routes.delete('/:job_id', require('./deleteJob'))

/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Job members
 **/
routes.use('/:job_id/members', require('./jobMembers'))

/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/comments Job comments
 */
routes.use('/:job_id/comments', require('./comments'))

module.exports = routes
