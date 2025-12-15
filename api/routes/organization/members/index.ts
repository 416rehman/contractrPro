import getMembers from './getMembers';
import getMember from './getMember';
import createMember from './createMember';
import updateMember from './updateMember';
import deleteMember from './deleteMember';
import { Router } from 'express';
const routes = Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/members Get organization members
 */
routes.get('/', getMembers)

/**
 * @api {get} /organizations/:org_id/members/:user_id Get organization member
 */
routes.get('/:member_id', getMember)

/**
 * @api {post} /organizations/:org_id/members Add to organization
 */
routes.post('/', createMember)

/**
 * @api {put} /organizations/:org_id/members/:member_id Update organization member
 */
routes.put('/:member_id', updateMember)

/**
 * @api {delete} /organizations/:org_id/members/:member_id Remove from organization
 */
routes.delete('/:member_id', deleteMember)

export default routes
