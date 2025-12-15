/**
 * Model: https://www.figma.com/file/oXjOLhFELvDrGkTz8BIJUI/Untitled
 */

import cors from 'cors';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import logger from './utils/logger';
import { createErrorResponse } from './utils/response';
import { ErrorCode } from './utils/errorCodes';
import routes from './routes';
import pinoHttp from 'pino-http';
import { swaggerSpec, swaggerUi } from './swagger';

const app: Application = express();

app.use(
    pinoHttp({
        // Use our default logger instance, which is already configured
        logger,
    })
);

const corsOptions = {
    origin: [process.env.CLIENT_URL || '', process.env.CLIENT_URL_DEV || ''],
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS', 'PUT', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.disable('x-powered-by');

// swagger docs at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// if development.
if (process.env.NODE_ENV === 'development') {
    // middleware to see the router path in the "Router" header for debugging
    app.use((req: Request, res: Response, next: NextFunction) => {
        const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
        res.set('Router', path);
        next();
    });
}

app.use('/', routes);

app.use((req: Request, res: Response) => {
    return res.status(404).json(createErrorResponse(ErrorCode.ROUTE_NOT_FOUND));
});

export default app;

