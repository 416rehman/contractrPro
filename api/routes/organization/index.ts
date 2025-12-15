import postOrganization from './postOrganization';
import getOrganization from './getOrganization';
import deleteOrganization from './deleteOrganization';
import requestDelete from './requestDelete';
import putOrganization from './putOrganization';
import search from './search';
import blob from './blob';
import clients from './clients';
import expenses from './expenses';
import invoices from './invoices';
import vendors from './vendors';
import summary from './summary';
import roles from './roles'; // Import roles handler
import { Router } from 'express';
const routes = Router({ mergeParams: true })
import contract_router from './contracts';
import member_router from './members';
import invite_router from './invites';
import { authorizeOrg } from '../../middleware/permissions';
import { OrgPermissions } from '../../db/flags';
// ... existing imports

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {post} /organizations/ Create organization
 */
routes.post('/', postOrganization)

/**
 * @api {get} /organizations/:org_id Get organization by id
 */
routes.get('/:org_id', authorizeOrg(), getOrganization) // View Org implicit or pass VIEW_ORG? Default allows any member.

/**
 * @api {post} /organizations/:org_id/request-delete Request delete token
 */
routes.post('/:org_id/request-delete', authorizeOrg(OrgPermissions.DELETE_ORG), requestDelete)

/**
 * @api {delete} /organizations/:org_id Delete organization
 */
routes.delete('/:org_id', authorizeOrg(OrgPermissions.DELETE_ORG), deleteOrganization)

/**
 * @api {put} /organizations/:org_id Update organization
 */
routes.put('/:org_id', authorizeOrg(OrgPermissions.EDIT_ORG), putOrganization)

/**
 * @api {get} /organizations/:org_id/search?q= Search organization
 */
routes.get('/:org_id/search', authorizeOrg(OrgPermissions.VIEW_ORG), search)

/**
 * @api {use} /organizations/:org_id/blob Get Blob
 */
routes.use('/:org_id/blob', authorizeOrg(OrgPermissions.VIEW_ORG), blob)

/**
 * @api {get} /organizations/:org_id/members Uses the organization's member router
 */
routes.use('/:org_id/members', authorizeOrg(OrgPermissions.VIEW_ORG), member_router)

/**
 * @api {get} /organizations/:org_id/invites Uses the organization's invite router
 */
routes.use('/:org_id/invites', authorizeOrg(OrgPermissions.MANAGE_MEMBERS), invite_router)

/**
 * @api {use} /organizations/:org_id/contracts Uses the organization's contracts router
 */
routes.use('/:org_id/contracts', authorizeOrg(OrgPermissions.VIEW_ORG), contract_router)

/**
 * @api {use} /organizations/:org_id/clients Uses the organization's clients router
 */
routes.use('/:org_id/clients', authorizeOrg(OrgPermissions.VIEW_ORG), clients)

/**
 * @api {use} /organizations/:org_id/expenses Uses the organization's expenses router
 */
routes.use('/:org_id/expenses', authorizeOrg(OrgPermissions.VIEW_FINANCES), expenses)

/**
 * @api {use} /organizations/:org_id/invoices Uses the organization's invoices router
 */
routes.use('/:org_id/invoices', authorizeOrg(OrgPermissions.VIEW_FINANCES), invoices)

/**
 * @api {use} /organizations/:org_id/vendors Uses the organization's vendors router
 */
routes.use('/:org_id/vendors', authorizeOrg(OrgPermissions.VIEW_ORG), vendors)

/**
 * @api {use} /organizations/:org_id/summary Uses the organization's summary router
 */
routes.use('/:org_id/summary', authorizeOrg(OrgPermissions.VIEW_ORG), summary)

/**
 * @api {get} /organizations/:org_id/roles Get available roles
 */
routes.get('/:org_id/roles', authorizeOrg(OrgPermissions.VIEW_ORG), roles)

export default routes
