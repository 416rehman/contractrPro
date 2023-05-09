const routes = require('express').Router({ mergeParams: true });

routes.use((req, res, next) => {
    const path = (__filename.split('/').slice(-1)[0]).split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/members Get organization members
 */
routes.get('/', (req, res) => {
    res.send('Get organization members')
});

/**
 * @api {get} /organizations/:org_id/members/:user_id Get organization member
 */
routes.get('/:user_id', (req, res) => {

});

/**
 * @api {post} /organizations/:org_id/members Add to organization
 */
routes.post('/', (req, res) => {

});

/**
 * @api {put} /organizations/:org_id/members Update organization members
 */
routes.put('/', (req, res) => {

});

/**
 * @api {delete} /organizations/:org_id/members/:member_id Remove from organization
 */
routes.delete('/:member_id', (req, res) => {

});

module.exports = routes;