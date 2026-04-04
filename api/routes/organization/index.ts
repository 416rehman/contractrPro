import postOrganization from './postOrganization'
import getOrganization from './getOrganization'
import deleteOrganization from './deleteOrganization'
import requestDelete from './requestDelete'
import putOrganization from './putOrganization'
import search from './search'
import blob from './blob'
import clients from './clients'
import expenses from './expenses'
import invoices from './invoices'
import vendors from './vendors'
import summary from './summary'
import roles from './roles'
import payments from './payments'
import stripeRoutes from './stripe'
import taxRates from './taxRates'
import { Router } from 'express'
import contract_router from './contracts'
import member_router from './members'
import invite_router from './invites'
import { authorizeOrg } from '../../middleware/permissions'
import { OrgPermissions } from '../../db/flags'

const routes = Router({ mergeParams: true })

routes.post('/', postOrganization)

routes.get('/:org_id', authorizeOrg(), getOrganization)

routes.post(
    '/:org_id/request-delete',
    authorizeOrg(OrgPermissions.DELETE_ORG),
    requestDelete
)

routes.delete(
    '/:org_id',
    authorizeOrg(OrgPermissions.DELETE_ORG),
    deleteOrganization
)

routes.put('/:org_id', authorizeOrg(OrgPermissions.EDIT_ORG), putOrganization)

routes.get('/:org_id/search', authorizeOrg(OrgPermissions.VIEW_ORG), search)

routes.use('/:org_id/blob', authorizeOrg(OrgPermissions.VIEW_ORG), blob)

routes.use(
    '/:org_id/members',
    authorizeOrg(OrgPermissions.VIEW_ORG),
    member_router
)

routes.use(
    '/:org_id/invites',
    authorizeOrg(OrgPermissions.MANAGE_MEMBERS),
    invite_router
)

routes.use(
    '/:org_id/contracts',
    authorizeOrg(OrgPermissions.VIEW_ORG),
    contract_router
)

routes.use('/:org_id/clients', authorizeOrg(OrgPermissions.VIEW_ORG), clients)

routes.use(
    '/:org_id/expenses',
    authorizeOrg(OrgPermissions.VIEW_FINANCES),
    expenses
)

routes.use(
    '/:org_id/invoices',
    authorizeOrg(OrgPermissions.VIEW_FINANCES),
    invoices
)

routes.use('/:org_id/vendors', authorizeOrg(OrgPermissions.VIEW_ORG), vendors)

routes.use('/:org_id/summary', authorizeOrg(OrgPermissions.VIEW_ORG), summary)

routes.get('/:org_id/roles', authorizeOrg(OrgPermissions.VIEW_ORG), roles)

// payments: record and track money movements
routes.use(
    '/:org_id/payments',
    authorizeOrg(OrgPermissions.VIEW_FINANCES),
    payments
)

// stripe connect: onboarding and status
routes.use(
    '/:org_id/stripe',
    authorizeOrg(OrgPermissions.VIEW_ORG),
    stripeRoutes
)

// tax rates: configurable per org
routes.use(
    '/:org_id/tax-rates',
    authorizeOrg(OrgPermissions.VIEW_ORG),
    taxRates
)

export default routes
