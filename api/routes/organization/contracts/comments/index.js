const attachmentsMiddleware = require('../../../../middleware/attachmentsMiddleware')
const routes = require('express').Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/comments Get organization contract comments
 */
routes.get('/', require('./getComments'))

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/comments Add to organization contract
 */
routes.post('/', attachmentsMiddleware, require('./createComment'))

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/comments/:comment_id Update organization contract comment
 */
routes.put('/:comment_id', attachmentsMiddleware, require('./updateComment'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/comments/:comment_id Remove from organization contract
 */
routes.delete('/:comment_id', require('./deleteComment'))

module.exports = routes
