/**
 * Model: https://www.figma.com/file/oXjOLhFELvDrGkTz8BIJUI/Untitled
 */

const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const routes = require('./routes')

// Use logging middleware
const logger = require('./utils/logger')
const { createErrorResponse } = require('./utils/response')
const pino = require('pino-http')({
    // Use our default logger instance, which is already configured
    logger,
})

const corsOptions = {
    origin: ['http://localhost:3000', '*'],
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

const app = express()
app.use(pino)
app.use(cors(corsOptions))
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