const auth_service = require('../../services/auth-service')
const {ValidationErrorsHandler} = require('../../middleware/validation-middleware')
const checkAuth = require('../../middleware/auth-middleware')
const {GetAccountTokenValidator, RegisterAccountValidator} = require('../../validators/auth-validator')
const {signJWT} = require('../../utils.js')
const routes = require('express').Router();

routes.use((req, res, next) => {
    const path = (__filename.split('/').slice(-1)[0]).split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {post} /auth/login Gets the user's opaque refresh token
 * @apiName Login
 */
routes.post('/login', GetAccountTokenValidator, ValidationErrorsHandler, async (req, res) => {
    try {
        const {username, email, password} = req.body
        console.log(req.body)
        const user = await auth_service.authenticate(username, email, password)
        res.json({
            refresh_token: user.refresh_token
        })
    } catch (error) {
        res.status(401).json({
            error: error.message
        })
    }
})

/**
 * @api {get} /auth/ Get account token via refresh token
 * @apiName GetAccountToken
 */
routes.get('/token', (req, res) => {
    if (!req.query.refresh_token && !req.body.refresh_token) res.status(400).json({error: 'Missing refresh token'})
    else {
        auth_service.verifyRefreshToken(req.query.refresh_token || req.body.refresh_token ).then(user => {
            signJWT({id: user.id, username: user.username}, process.env.JWT_SECRET).then(token => res.json(token))
                .catch(err => res.status(500).json(err.message))
        }).catch(err => {
            res.status(401).json(err.message)
        })
    }
});

/**
 * @api {post} /auth/register Register new account
 * @apiName RegisterAccount
 */
routes.post('/account', RegisterAccountValidator, ValidationErrorsHandler, (req, res) => {
    auth_service.createUser(req.body).then(user => {
        res.json(user)
    }).catch(err => {
        res.status(401).json(err.message)
    })
});

/**
 * @api {delete} /auth/account Delete account
 * @apiName DeleteAccount
 */
routes.delete('/account',  checkAuth, (req, res) => {
    auth_service.deleteUser(req.auth.username).then(user => {
        res.json(user)
    }).catch(err => {
        res.status(401).json(err.message)
    })
});

module.exports = routes;
