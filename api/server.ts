import cors from 'cors'
import express, { Application, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import logger from './utils/logger'
import { createErrorResponse } from './utils/response'
import { ErrorCode } from './utils/errorCodes'
import routes from './routes'
import pinoHttp from 'pino-http'
import { apiReference } from '@scalar/express-api-reference'
import { swaggerSpec } from './swagger'

const app: Application = express()

app.use(
    pinoHttp({
        logger,
    })
)

const corsOptions = {
    origin: [process.env.CLIENT_URL || '', process.env.CLIENT_URL_DEV || ''],
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS', 'PUT', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

app.use(cors(corsOptions))
app.use(compression())
app.use(cookieParser(process.env.COOKIE_SECRET))

// stripe webhooks need the raw body for signature verification
// mount this before the json body parser
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }))

// everything else gets json parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.disable('x-powered-by')

// scalar docs at /docs before helmet enforces csp
app.use(
    '/docs',
    apiReference({
        spec: {
            content: swaggerSpec,
        },
    })
)

app.use(helmet())

app.use('/', routes)

app.use((req: Request, res: Response) => {
    return res.status(404).json(createErrorResponse(ErrorCode.ROUTE_NOT_FOUND))
})

export default app
