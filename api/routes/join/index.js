const routes = require('express').Router({ mergeParams: true })

/**
 * @api {post} /join/:invite_id Join organization by invite
 */
routes.post('/:invite_id', require('./joinOrganization'))

module.exports = routes
