import { Router } from 'express';
import { createSuccessResponse } from '../utils/response';
import checkAuth from '../middleware/authMiddleware';
import adminMiddleware from '../middleware/adminMiddleware';

import authRoutes from './auth';
import confirmHandler from './confirm';
import userRoutes from './user';
import orgRoutes from './organization';
import joinRoutes from './join';
import adminRoutes from './admin';

const routes = Router();

routes.use((req, res, next) => {
    // @ts-ignore
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});

routes.get('/', (req, res) => {
    res.json(createSuccessResponse('Connected'));
});

routes.use('/auth', authRoutes);
routes.post('/confirm', confirmHandler);

routes.use('/users', checkAuth, userRoutes);
routes.use('/organizations', checkAuth, orgRoutes);
routes.use('/join', checkAuth, joinRoutes);

routes.use('/admin', adminMiddleware, adminRoutes);

export default routes;
