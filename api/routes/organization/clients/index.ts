import getClients from './getClients';
import getClient from './getClient';
import createClient from './createClient';
import updateClient from './updateClient';
import deleteClient from './deleteClient';
import comments from './comments';
import { Router } from 'express';
import { authorizeOrg } from '../../../middleware/permissions';
import { OrgPermissions } from '../../../db/flags';

const routes = Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/clients Get organization clients
 */
routes.get('/', getClients)

/**
 * @api {get} /organizations/:org_id/clients/:client_id Get organization client
 */
routes.get('/:client_id', getClient)

/**
 * @api {post} /organizations/:org_id/clients Add to organization
 */
routes.post('/', authorizeOrg(OrgPermissions.MANAGE_CLIENTS), createClient)

/**
 * @api {put} /organizations/:org_id/clients/:client_id Update organization client
 */
routes.put('/:client_id', authorizeOrg(OrgPermissions.MANAGE_CLIENTS), updateClient)

/**
 * @api {delete} /organizations/:org_id/clients/:client_id Remove from organization
 */
routes.delete('/:client_id', authorizeOrg(OrgPermissions.MANAGE_CLIENTS), deleteClient)

/**
 * @api {use} /organizations/:org_id/clients/:client_id/comments Client comments
 */
routes.use('/:client_id/comments', comments)
export default routes
