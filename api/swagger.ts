import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { ErrorCode } from './utils/errorCodes';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ContractrPro API',
            version: '1.0.0',
            description: 'API for contractors to manage projects, invoices, clients, etc.',
        },
        servers: [
            { url: '/', description: 'API Server' }
        ],
        components: {
            schemas: {
                // standard success response shape
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'success' },
                        data: { type: 'object' },
                    },
                },
                // standard error response shape
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: {
                            type: 'string',
                            enum: Object.values(ErrorCode),
                            description: 'Localization key for the error',
                        },
                        details: { type: 'string', nullable: true },
                    },
                },
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    // scan all route files for @openapi comments
    apis: ['./routes/**/*.ts', './routes/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
