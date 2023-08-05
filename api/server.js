/**
 * Model: https://www.figma.com/file/oXjOLhFELvDrGkTz8BIJUI/Untitled
 */

const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const logger = require('./utils/logger')
const { createErrorResponse } = require('./utils/response')
const routes = require('./routes')

const app = express()
app.use(
    require('pino-http')({
        // Use our default logger instance, which is already configured
        logger,
    })
)
app.use(cors())
app.options('*', cors())
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.disable('x-powered-by')

// if development.
if (process.env.NODE_ENV === 'development') {
    // middleware to see the router path in the "Router" header for debugging
    app.use((req, res, next) => {
        const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
        res.set('Router', path)
        next()
    })
}

app.options('*', cors())

app.use('/', routes)

app.use((req, res) => {
    return res.status(404).json(createErrorResponse('Cannot find this route'))
})

module.exports = app
