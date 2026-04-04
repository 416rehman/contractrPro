import { Request, Response, Router } from 'express'
import { db, invoices } from '../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response'
import { ErrorCode } from '../../utils/errorCodes'
import { InvoiceStatus } from '../../db/enums'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
import { publicLimiter } from '../../middleware/rateLimit'

const routes = Router()

// public invoice view — no auth required, uses a signed JWT token
routes.get(
    '/invoices/:token',
    publicLimiter,
    async (req: Request, res: Response) => {
        try {
            const token = req.params.token

            let decoded: any
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET!)
            } catch (err) {
                return res
                    .status(400)
                    .json(
                        createErrorResponse(ErrorCode.VALIDATION_INVALID_TOKEN)
                    )
            }

            const invoice = await db.query.invoices.findFirst({
                where: eq(invoices.id, decoded.invoiceId),
                with: {
                    invoiceEntries: true,
                    client: true,
                    organization: {
                        columns: {
                            id: true,
                            name: true,
                            logo: true,
                            currency: true,
                        },
                    },
                },
            })

            if (!invoice) {
                return res
                    .status(404)
                    .json(createErrorResponse(ErrorCode.INVOICE_NOT_FOUND))
            }

            // mark as viewed if this is the first time
            if (invoice.status === InvoiceStatus.Sent) {
                await db
                    .update(invoices)
                    .set({
                        status: InvoiceStatus.Viewed,
                        updatedAt: new Date(),
                    })
                    .where(eq(invoices.id, invoice.id))
            }

            // calculate totals for the client view
            let subtotal = 0
            for (const entry of invoice.invoiceEntries) {
                subtotal +=
                    (Number(entry.quantity) || 0) *
                    (Number(entry.unitCost) || 0)
            }
            const taxRate = Number(invoice.taxRate) || 0
            const taxAmount = subtotal * (taxRate / 100)
            const total = subtotal + taxAmount

            return res.status(200).json(
                createSuccessResponse({
                    invoice: {
                        id: invoice.id,
                        invoiceNumber: invoice.invoiceNumber,
                        issueDate: invoice.issueDate,
                        dueDate: invoice.dueDate,
                        note: invoice.note,
                        status: invoice.status,
                        taxRate: invoice.taxRate,
                        paymentUrl: invoice.paymentUrl,
                    },
                    entries: invoice.invoiceEntries,
                    client: invoice.client,
                    organization: invoice.organization,
                    totals: {
                        subtotal,
                        taxAmount,
                        taxRate,
                        total,
                        balance: Number(invoice.balance),
                        amountPaid: total - Number(invoice.balance),
                    },
                })
            )
        } catch (e: any) {
            return res
                .status(500)
                .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
        }
    }
)

export default routes
