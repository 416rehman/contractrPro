import swaggerJsdoc from 'swagger-jsdoc'
import { ErrorCode } from './utils/errorCodes'

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ContractrPro API',
            version: '2.0.0',
            description:
                'API for contractors to manage projects, invoices, payments, clients, and more.',
        },
        servers: [{ url: '/', description: 'API Server' }],
        components: {
            schemas: {
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'success' },
                        data: { type: 'object' },
                    },
                },
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
        'x-tagGroups': [
            {
                name: 'Access Control',
                tags: ['Auth', 'Users', 'Invites', 'Members'],
            },
            {
                name: 'Organization',
                tags: ['Organizations', 'Summary', 'Search'],
            },
            {
                name: 'Clients',
                tags: ['Clients', 'ClientComments'],
            },
            {
                name: 'Contracts',
                tags: [
                    'Contracts',
                    'ContractComments',
                    'ContractProfitability',
                ],
            },
            {
                name: 'Jobs',
                tags: ['Jobs', 'JobComments'],
            },
            {
                name: 'Invoices',
                tags: [
                    'Invoices',
                    'InvoiceEntries',
                    'InvoiceComments',
                    'InvoiceSend',
                ],
            },
            {
                name: 'Expenses',
                tags: ['Expenses', 'ExpenseEntries', 'ExpenseComments'],
            },
            {
                name: 'Vendors',
                tags: ['Vendors', 'VendorComments'],
            },
            {
                name: 'Payments',
                tags: ['Payments'],
            },
            {
                name: 'Finance Config',
                tags: ['TaxRates', 'Stripe'],
            },
            {
                name: 'Public',
                tags: ['PublicInvoice'],
            },
            {
                name: 'Webhooks',
                tags: ['Webhooks'],
            },
        ],
    },
    apis: ['./routes/**/*.ts', './routes/**/*.js'],
}

export const swaggerSpec = swaggerJsdoc(options)
