import getBlob from './getBlob';
import { Router } from 'express';
const routes = Router({ mergeParams: true })

routes.get('/:blob_id', getBlob)

export default routes
