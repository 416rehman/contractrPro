import { Router } from 'express'
import { Request, Response } from 'express'
import { z } from 'zod'
import { db, taxRates } from '../../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response'
import { ErrorCode } from '../../../utils/errorCodes'
import { authorizeOrg } from '../../../middleware/permissions'
import { OrgPermissions } from '../../../db/flags'
import { eq, and } from 'drizzle-orm'
import { isValidUUID } from '../../../utils/isValidUUID'

const routes = Router({ mergeParams: true })

const taxRateSchema = z.object({
    name: z.string().min(1).max(100),
    rate: z.coerce.number().min(0).max(100),
    description: z.string().optional(),
    isDefault: z.boolean().optional(),
})

// list tax rates
routes.get(
    '/',
    authorizeOrg(OrgPermissions.VIEW_ORG),
    async (req: Request, res: Response) => {
        try {
            const orgId = req.params.org_id
            const rates = await db.query.taxRates.findMany({
                where: eq(taxRates.organizationId, orgId),
            })
            return res.status(200).json(createSuccessResponse(rates))
        } catch (e: any) {
            return res
                .status(500)
                .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
        }
    }
)

// create tax rate
routes.post(
    '/',
    authorizeOrg(OrgPermissions.MANAGE_FINANCES),
    async (req: Request, res: Response) => {
        try {
            const orgId = req.params.org_id
            const parsed = taxRateSchema.safeParse(req.body)

            if (!parsed.success) {
                return res.status(400).json(
                    createErrorResponse(ErrorCode.VALIDATION_INVALID_VALUE, {
                        fields: parsed.error.issues.map((i) => ({
                            field: i.path.join('.'),
                            message: i.message,
                        })),
                    })
                )
            }

            const [rate] = await db
                .insert(taxRates)
                .values({
                    name: parsed.data.name,
                    rate: String(parsed.data.rate),
                    description: parsed.data.description,
                    isDefault: parsed.data.isDefault || false,
                    organizationId: orgId,
                })
                .returning()

            return res.status(201).json(createSuccessResponse(rate))
        } catch (e: any) {
            return res
                .status(500)
                .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
        }
    }
)

// update tax rate
routes.put(
    '/:tax_rate_id',
    authorizeOrg(OrgPermissions.MANAGE_FINANCES),
    async (req: Request, res: Response) => {
        try {
            const orgId = req.params.org_id
            const taxRateId = req.params.tax_rate_id

            if (!taxRateId || !isValidUUID(taxRateId)) {
                return res
                    .status(400)
                    .json(
                        createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID)
                    )
            }

            const parsed = taxRateSchema.partial().safeParse(req.body)
            if (!parsed.success) {
                return res.status(400).json(
                    createErrorResponse(ErrorCode.VALIDATION_INVALID_VALUE, {
                        fields: parsed.error.issues.map((i) => ({
                            field: i.path.join('.'),
                            message: i.message,
                        })),
                    })
                )
            }

            const updateData: Record<string, any> = { updatedAt: new Date() }
            if (parsed.data.name !== undefined)
                updateData.name = parsed.data.name
            if (parsed.data.rate !== undefined)
                updateData.rate = String(parsed.data.rate)
            if (parsed.data.description !== undefined)
                updateData.description = parsed.data.description
            if (parsed.data.isDefault !== undefined)
                updateData.isDefault = parsed.data.isDefault

            const [updated] = await db
                .update(taxRates)
                .set(updateData)
                .where(
                    and(
                        eq(taxRates.id, taxRateId),
                        eq(taxRates.organizationId, orgId)
                    )
                )
                .returning()

            if (!updated) {
                return res
                    .status(404)
                    .json(createErrorResponse(ErrorCode.TAX_RATE_NOT_FOUND))
            }

            return res.status(200).json(createSuccessResponse(updated))
        } catch (e: any) {
            return res
                .status(500)
                .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
        }
    }
)

// delete tax rate
routes.delete(
    '/:tax_rate_id',
    authorizeOrg(OrgPermissions.MANAGE_FINANCES),
    async (req: Request, res: Response) => {
        try {
            const orgId = req.params.org_id
            const taxRateId = req.params.tax_rate_id

            if (!taxRateId || !isValidUUID(taxRateId)) {
                return res
                    .status(400)
                    .json(
                        createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID)
                    )
            }

            const [deleted] = await db
                .delete(taxRates)
                .where(
                    and(
                        eq(taxRates.id, taxRateId),
                        eq(taxRates.organizationId, orgId)
                    )
                )
                .returning()

            if (!deleted) {
                return res
                    .status(404)
                    .json(createErrorResponse(ErrorCode.TAX_RATE_NOT_FOUND))
            }

            return res
                .status(200)
                .json(createSuccessResponse({ deleted: true }))
        } catch (e: any) {
            return res
                .status(500)
                .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
        }
    }
)

export default routes
