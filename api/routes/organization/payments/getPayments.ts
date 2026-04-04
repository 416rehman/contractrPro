import { Request, Response } from 'express'
import { db, payments } from '../../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response'
import { ErrorCode } from '../../../utils/errorCodes'
import { eq, and, desc, gte, lte } from 'drizzle-orm'

// list payments for an organization with optional filters
export default async (req: Request, res: Response) => {
    try {
        const orgId = req.params.org_id
        const { type, method, invoiceId, expenseId, contractId, from, to } =
            req.query as Record<string, string>

        const conditions = [eq(payments.organizationId, orgId)]

        if (type) conditions.push(eq(payments.type, type))
        if (method) conditions.push(eq(payments.method, method))
        if (invoiceId) conditions.push(eq(payments.invoiceId, invoiceId))
        if (expenseId) conditions.push(eq(payments.expenseId, expenseId))
        if (contractId) conditions.push(eq(payments.contractId, contractId))
        if (from) conditions.push(gte(payments.date, new Date(from)))
        if (to) conditions.push(lte(payments.date, new Date(to)))

        const results = await db.query.payments.findMany({
            where: and(...conditions),
            orderBy: [desc(payments.date)],
            with: {
                invoice: true,
                expense: true,
                recordedBy: {
                    columns: {
                        id: true,
                        name: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
            },
        })

        return res.status(200).json(createSuccessResponse(results))
    } catch (e: any) {
        return res
            .status(500)
            .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}
