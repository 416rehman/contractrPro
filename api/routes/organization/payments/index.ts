import { Router } from 'express'
import { authorizeOrg } from '../../../middleware/permissions'
import { OrgPermissions } from '../../../db/flags'
import createPayment from './createPayment'
import getPayments from './getPayments'
import getPayment from './getPayment'
import deletePayment from './deletePayment'

const routes = Router({ mergeParams: true })

routes.post('/', authorizeOrg(OrgPermissions.MANAGE_PAYMENTS), createPayment)
routes.get('/', authorizeOrg(OrgPermissions.VIEW_FINANCES), getPayments)
routes.get(
    '/:payment_id',
    authorizeOrg(OrgPermissions.VIEW_FINANCES),
    getPayment
)
routes.delete(
    '/:payment_id',
    authorizeOrg(OrgPermissions.MANAGE_PAYMENTS),
    deletePayment
)

export default routes
