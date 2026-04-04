import { Router } from 'express'
import { createSuccessResponse } from '../utils/response'
import checkAuth from '../middleware/authMiddleware'
import adminMiddleware from '../middleware/adminMiddleware'

import authRoutes from './auth'
import userRoutes from './user'
import orgRoutes from './organization'
import joinRoutes from './join'
import adminRoutes from './admin'
import publicInvoiceRoutes from './public/invoice'
import stripeWebhookRoutes from './webhooks/stripe'

const routes = Router()

routes.get('/', (req, res) => {
    res.json(createSuccessResponse(null))
})

// public routes (no auth)
routes.use('/auth', authRoutes)
routes.use('/p', publicInvoiceRoutes)

// stripe webhook needs raw body, mount before json parsing
// note: the server.ts must have express.raw() configured for this path
routes.use('/webhooks', stripeWebhookRoutes)

routes.post('/auth/verify-email', (req, res, next) => {
    require('./auth/verifyEmail').default(req, res, next)
})

routes.post('/auth/verify-phone', (req, res, next) => {
    require('./auth/verifyPhone').default(req, res, next)
})

// authenticated routes
routes.use('/users', checkAuth, userRoutes)
routes.use('/organizations', checkAuth, orgRoutes)
routes.use('/join', checkAuth, joinRoutes)

// admin routes
routes.use('/admin', adminMiddleware, adminRoutes)

export default routes
