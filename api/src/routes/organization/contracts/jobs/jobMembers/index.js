const routes = require('express').Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Get organization contract job members
 */
routes.get('/', require('./getJobMembers'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members/:member_id Get organization contract job member
 */
routes.get('/:member_id', require('./getJobMember'))

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Add member to organization contract job
 */
routes.post('/', require('./createJobMember'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Remove member from organization contract job
 */
routes.delete('/:member_id', require('./deleteJobMember'))

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members/:member_id Update organization contract job member
 */
routes.put('/:member_id', require('./updateJobMember'))

module.exports = routes
