import { Request, Response } from 'express'
import { db, payments } from '../../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response'
import { ErrorCode } from '../../../utils/errorCodes'
import { eq, and } from 'drizzle-orm'
import { isValidUUID } from '../../../utils/isValidUUID'

// get a single payment by id
export default async (req: Request, res: Response) => {
    try {
        const orgId = req.params.org_id
        const paymentId = req.params.payment_id

        if (!paymentId || !isValidUUID(paymentId)) {
            return res
                .status(400)
                .json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const payment = await db.query.payments.findFirst({
            where: and(
                eq(payments.id, paymentId),
                eq(payments.organizationId, orgId)
            ),
            with: {
                invoice: { with: { client: true } },
                expense: { with: { vendor: true } },
                contract: true,
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

        if (!payment) {
            return res
                .status(404)
                .json(createErrorResponse(ErrorCode.PAYMENT_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(payment))
    } catch (e: any) {
        return res
            .status(500)
            .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}
