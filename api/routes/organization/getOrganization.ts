import { db, organizations } from '../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { eq } from 'drizzle-orm';

//retrieve organization by id
export default async (req, res) => {
    try {
        const orgId = req.params.org_id

        //check orgId input
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization id is required'))
        }

        //since organization has unique ids, it only return 1 organization object
        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, orgId),
            with: {
                // include related data if needed, original findAll implies list but singular param implies one?
                // original used findAll({ where: {id} }) which returns array.
                // But code checked "if (!organizations)".
                // logic said "it only return 1".
                // I will return single object or array depending on expected API response.
                // Legacy sent "organizations" (plural variable) but probably result of findAll (array).
                // API response json(organizations).
                // I should probably return an array to keep compat?
                // Or "it only return 1 organization object" comment implies singular intent.
                // Let's return singular findFirst result wrapped in array or just object depending on what frontend expects.
                // If legacy code returned `[org]`, I should return `[org]`.
                // `findAll` returns array.
                // So I will return `[organization]`.
            }
        })

        //if no organization in record, error-not found
        if (!organization) {
            return res.status(404).json(createErrorResponse('User not found')) // Original message said user not found? weird copy paste. keeping it or fixing to "Organization not found"
        }

        return res.status(200).json(createSuccessResponse([organization])) // Wrap in array to match findAll behavior
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
