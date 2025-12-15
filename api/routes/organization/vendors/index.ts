import getVendors from './getVendors';
import getVendor from './getVendor';
import createVendor from './createVendor';
import updateVendor from './updateVendor';
import deleteVendor from './deleteVendor';
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
 * @api {get} /organizations/:org_id/vendors Get organization vendors
 */
routes.get('/', getVendors)

/**
 * @api {get} /organizations/:org_id/vendors/:vendor_id Get organization vendor
 */
routes.get('/:vendor_id', getVendor)

/**
 * @api {post} /organizations/:org_id/vendors Add to organization
 */
routes.post('/', authorizeOrg(OrgPermissions.MANAGE_VENDORS), createVendor)

/**
 * @api {put} /organizations/:org_id/vendors/:vendor_id Update organization vendor
 */
routes.put('/:vendor_id', authorizeOrg(OrgPermissions.MANAGE_VENDORS), updateVendor)

/**
 * @api {delete} /organizations/:org_id/vendors/:vendor_id Remove from organization
 */
routes.delete('/:vendor_id', authorizeOrg(OrgPermissions.MANAGE_VENDORS), deleteVendor)

/**
 * @api {use} /organizations/:org_id/vendors/:vendor_id/comments Invoice comments
 */
routes.use('/:vendor_id/comments', comments)

export default routes
