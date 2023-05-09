const routes = require('express').Router({ mergeParams: true });

routes.use((req, res, next) => {
    const path = (__filename.split('/').slice(-1)[0]).split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/invites Get organization invites
 */
routes.get('/', (req, res) => {

});

/**
 * @api {get} /organizations/:org_id/invites/:invite_id Get organization invite
 */
routes.get('/:invite_id', (req, res) => {

});

/**
 * @api {post} /organizations/:org_id/invites Create organization invite
 */
routes.post('/', (req, res) => {

});

/**
 * @api {put} /organizations/:org_id/invites/:invite_id Update organization invite
 */
routes.put('/:invite_id', (req, res) => {

});

/**
 * @api {delete} /organizations/:org_id/invites/:invite_id Delete organization invite
 */
routes.delete('/:invite_id', (req, res) => {

});

module.exports = routes;