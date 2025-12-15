import joinOrganization from './joinOrganization';
import { Router } from 'express';
const routes = Router({ mergeParams: true })

/**
 * @api {post} /join/:invite_id Join organization by invite
 */
routes.post('/:invite_id', joinOrganization)

export default routes
