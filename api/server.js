/**
 * Model: https://www.figma.com/file/oXjOLhFELvDrGkTz8BIJUI/Untitled
 */

const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const cookieSession = require('cookie-session')
const routes = require('./routes')
const checkAuth = require('./middleware/authMiddleware')

// Use logging middleware
const logger = require('./utils/logger')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('./utils/response')
const pino = require('pino-http')({
    // Use our default logger instance, which is already configured
    logger,
})

const corsOptions = {
    origin: ['http://localhost:3000'],
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
app.use(
    cookieSession({
        name: 'contractrPro',
        keys: [
            process.env.SECRET_SESSION_KEY_1,
            process.env.SECRET_SESSION_KEY_2,
        ],
        cookie: {
            secure: true,
            httpOnly: true,
            domain: 'contractr.pro',
            expires: new Date(Date.now() + 60 * 60 * 1000),
        },
    })
)
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

app.get('/', (req, res) => {
    res.json(createSuccessResponse('Connected'))
})

app.use('/auth', routes.auth)
app.use(checkAuth) // authentication middleware
app.use('/users/', routes.user)
app.use('/organizations/', routes.organization)
app.use('/join/', routes.join)
// TODO: Protect admin routes from non-admin users
app.use('/admin/', routes.admin)

// TODO: Move this so this is part of each resource, i.e /users/:id/comments, /users/:id/organizations, etc.
// app.post('/comments', async (req, res) => {
//     const commentContent = req.body.content
//     const commentAttachments = req.files || []
//     const commentUsername = req.auth.username
//     const commentUserId = req.auth.id
//
//     let filesUploaded = 0
//     for (const attachment of commentAttachments) {
//         const uploadParams = {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: attachment.originalname,
//             Body: attachment.buffer,
//         }
//
//         try {
//             await s3Client.send(new PutObjectCommand(uploadParams))
//             filesUploaded++
//         } catch (err) {
//             logger.error(err)
//         }
//     }
//
//     return res.json({
//         content: commentContent,
//         attachments: commentAttachments.map(
//             (attachment) => attachment.originalname
//         ),
//         userId: commentUserId,
//         username: commentUsername,
//         filesUploaded: filesUploaded,
//     })
// })

app.use((req, res) => {
    res.status(404).json(createErrorResponse('Cannot find this route'))
})

app.use((err, req, res) => {
    logger.error(err.stack)
    res.status(500).json(
        createErrorResponse('An unexpected problem has occured.', err)
    )
})

module.exports = app