const attachmentsMiddleware = require('../../../../middleware/attachmentsMiddleware')
const routes = require('express').Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/expenses/:expense_id/comments Get organization expense comments
 */
routes.get('/', require('./getComments'))

/**
 * @api {post} /organizations/:org_id/expenses/:expense_id/comments Add to organization expense
 */
routes.post('/', attachmentsMiddleware, require('./createComment'))

/**
 * @api {put} /organizations/:org_id/expenses/:expense_id/comments/:comment_id Update organization expense comment
 */
routes.put('/:comment_id', attachmentsMiddleware, require('./updateComment'))

/**
 * @api {delete} /organizations/:org_id/expenses/:expense_id/comments/:comment_id Remove from organization expense
 */
routes.delete('/:comment_id', require('./deleteComment'))

module.exports = routes
