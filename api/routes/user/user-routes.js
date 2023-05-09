const user_service = require('../../services/user-service')
const routes = require('express').Router();

routes.use((req, res, next) => {
    const path = (__filename.split('/').slice(-1)[0]).split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

routes.get('/', (req, res) => {
    user_service.ping(req, res);
});

routes.get('/:user_id', (req, res) => {

});

/**
 * @api {post} /user/:user_id/organizations Get organizations of a user
 */
routes.get('/:user_id/organizations', (req, res) => {

});

/**
 * @api {delete} /user/:user_id/organizations/:org_id leave the organization
 */
routes.delete('/:user_id/organizations/:org_id', (req, res) => {

});


module.exports = routes;