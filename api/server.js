/**
 * Model: https://www.figma.com/file/oXjOLhFELvDrGkTz8BIJUI/Untitled
 */

require('dotenv').config()
const cors = require('cors');
const express = require('express'),
    routes = require('./routes'),
    {sequelize} = require('./models')
const {tokenAuthHandler} = require("./middleware/auth-middleware");

const port = process.env.PORT || 3000
const app = express()
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use((req, res, next) => {
    const path = (__filename.split('/').slice(-1)[0]).split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

app.get('/', (req, res) => {
    res.send('Connected!')
})

app.use('/auth', routes.auth)
app.use(tokenAuthHandler)   // security middleware, uses tokenAuthHandler to authenticate via access tokens in the authorization header
app.use('/users/', routes.user)
app.use('/organizations/',  routes.organization)

sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`listening at http://localhost:${port}/`)
    })
}).catch(err => {
    console.log(err)
})
