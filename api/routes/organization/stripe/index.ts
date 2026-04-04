import { Router } from 'express'
import { authorizeOrg } from '../../../middleware/permissions'
import { OrgPermissions } from '../../../db/flags'
import connectStripe from './connectStripe'
import stripeStatus from './stripeStatus'

const routes = Router({ mergeParams: true })

routes.post('/connect', authorizeOrg(OrgPermissions.EDIT_ORG), connectStripe)
routes.get('/status', authorizeOrg(OrgPermissions.VIEW_ORG), stripeStatus)

export default routes
