import postOrganization from './postOrganization';
import getOrganization from './getOrganization';
import deleteOrganization from './deleteOrganization';
import putOrganization from './putOrganization';
import search from './search';
import blob from './blob';
import clients from './clients';
import expenses from './expenses';
import invoices from './invoices';
import vendors from './vendors';
import summary from './summary';
import { Router } from 'express';
const routes = Router({ mergeParams: true })
import contract_router from './contracts';
import member_router from './members';
import invite_router from './invites';
import { createErrorResponse  } from '../../utils/response';

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

const authorizeOrg = async (req, res, next) => {
    const organizationId = req.params.org_id
    // Checks the req.auth.Organizations array for the organizationId
    const organization = req.auth.Organizations.find(
        (org) => org.id === organizationId
    )
    if (!organization) {
        return res
            .status(403)
            .json(createErrorResponse('Access token is missing or invalid')) // Ambiguous error message to prevent leaking information
    } else {
        return next()
    }
}

/**
 * @api {post} /organizations/ Create organization
 */
routes.post('/', postOrganization)

/**
 * @api {get} /organizations/:org_id Get organization by id
 */
routes.get('/:org_id', authorizeOrg, getOrganization)

/**
 * @api {delete} /organizations/:org_id Delete organization
 */
routes.delete('/:org_id', authorizeOrg, deleteOrganization)

/**
 * @api {put} /organizations/:org_id Update organization
 */
routes.put('/:org_id', authorizeOrg, putOrganization)

/**
 * @api {get} /organizations/:org_id/search?q= Search organization
 */
routes.get('/:org_id/search', authorizeOrg, search)

/**
 * @api {use} /organizations/:org_id/blob Get Blob
 */
routes.use('/:org_id/blob', authorizeOrg, blob)

/**
 * @api {get} /organizations/:org_id/members Uses the organization's member router
 */
routes.use('/:org_id/members', authorizeOrg, member_router)

/**
 * @api {get} /organizations/:org_id/invites Uses the organization's invite router
 */
routes.use('/:org_id/invites', authorizeOrg, invite_router)

/**
 * @api {use} /organizations/:org_id/contracts Uses the organization's contracts router
 */
routes.use('/:org_id/contracts', authorizeOrg, contract_router)

/**
 * @api {use} /organizations/:org_id/clients Uses the organization's clients router
 */
routes.use('/:org_id/clients', authorizeOrg, clients)

/**
 * @api {use} /organizations/:org_id/expenses Uses the organization's expenses router
 */
routes.use('/:org_id/expenses', authorizeOrg, expenses)

/**
 * @api {use} /organizations/:org_id/jobs Uses the organization's jobs router
 */
routes.use('/:org_id/invoices', authorizeOrg, invoices)

/**
 * @api {use} /organizations/:org_id/vendors Uses the organization's vendors router
 */
routes.use('/:org_id/vendors', authorizeOrg, vendors)

/**
 * @api {use} /organizations/:org_id/summary Uses the organization's summary router
 */
routes.use('/:org_id/summary', authorizeOrg, summary)

export default routes
