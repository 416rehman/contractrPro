import getComments from './getComments';
import createComment from './createComment';
import updateComment from './updateComment';
import deleteComment from './deleteComment';
import attachments from './attachments';
import attachmentsMiddleware from '../../../../middleware/attachmentsMiddleware';
import { Router } from 'express';
const routes = Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/comments Get organization contract comments
 */
routes.get('/', getComments)

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/comments Add to organization contract
 */
routes.post('/', attachmentsMiddleware, createComment)

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/comments/:comment_id Update organization contract comment
 */
routes.put('/:comment_id', attachmentsMiddleware, updateComment)

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/comments/:comment_id Remove from organization contract
 */
routes.delete('/:comment_id', deleteComment)

/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/comments/:comment_id/attachments Comment attachments
 */
routes.use('/:comment_id/attachments', attachments)

export default routes
