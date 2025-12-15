import getUsers from './getUsers';
import getOrganizations from './getOrganizations';
import updateUsers from './updateUsers';
import { Router } from 'express';
const routes = Router();

// /admin/users - Retrieves all users in the system
routes.get('/users', getUsers)

// /admin/organizations - Retrieves all organizations in the system
routes.get('/organizations', getOrganizations)

// /admin/users
routes.put('/users', updateUsers)

export default routes
