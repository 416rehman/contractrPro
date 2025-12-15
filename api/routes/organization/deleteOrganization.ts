import { db, organizations } from '../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { isValidUUID } from '../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const org_id = req.params.org_id
        if (!org_id || !isValidUUID(org_id)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        const deletedRows = await db.delete(organizations)
            .where(eq(organizations.id, org_id))
            .returning();

        if (!deletedRows.length) {
            return res
                .status(400)
                .json(createErrorResponse('Organization not found'))
        }

        res.status(200).json(createSuccessResponse(1)) // Return 1 to match "rowsDeleted" count behavior approximately
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
