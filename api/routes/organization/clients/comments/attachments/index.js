const routes = require('express').Router({ mergeParams: true })

/**
 * @api {delete} /organizations/:org_id/clients/:client_id/comments/:comment_id/attachments/:attachment_id Delete a comment attachment
 */
routes.delete('/:attachment_id', require('./deleteAttachment'))

module.exports = routes
