import deleteAttachment from './deleteAttachment';
import { Router } from 'express';
const routes = Router({ mergeParams: true })

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/comments/:comment_id/attachments/:attachment_id Delete a comment attachment
 */
routes.delete('/:attachment_id', deleteAttachment)

export default routes
