const attachmentsMiddleware = require('../../../../../middleware/attachmentsMiddleware')
const routes = require('express').Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/jobs/:job_id/comments Get organization job comments
 */
routes.get('/', require('./getComments'))

/**
 * @api {post} /organizations/:org_id/jobs/:job_id/comments Add to organization job
 */
routes.post('/', attachmentsMiddleware, require('./createComment'))

/**
 * @api {put} /organizations/:org_id/jobs/:job_id/comments/:comment_id Update organization job comment
 */
routes.put('/:comment_id', attachmentsMiddleware, require('./updateComment'))

/**
 * @api {delete} /organizations/:org_id/jobs/:job_id/comments/:comment_id Remove from organization job
 */
routes.delete('/:comment_id', require('./deleteComment'))

module.exports = routes
