const routes = require('express').Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/members Get organization members
 */
routes.get('/', require('./getMembers'))

/**
 * @api {get} /organizations/:org_id/members/:user_id Get organization member
 */
routes.get('/:member_id', require('./getMember'))

/**
 * @api {post} /organizations/:org_id/members Add to organization
 */
routes.post('/', require('./createMember'))

/**
 * @api {put} /organizations/:org_id/members/:member_id Update organization member
 */
routes.put('/:member_id', require('./updateMember'))

/**
 * @api {delete} /organizations/:org_id/members/:member_id Remove from organization
 */
routes.delete('/:member_id', require('./deleteMember'))

module.exports = routes
