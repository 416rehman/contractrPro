import { Request, Response } from 'express'
import { z } from 'zod'
import { db, payments, invoices, expenses } from '../../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response'
import { ErrorCode } from '../../../utils/errorCodes'
import { PaymentType, PaymentMethod, InvoiceStatus } from '../../../db/enums'
import { eq, and, sql } from 'drizzle-orm'

const createPaymentSchema = z.object({
    type: z.nativeEnum(PaymentType),
    amount: z.coerce.number().positive(),
    method: z.nativeEnum(PaymentMethod),
    reference: z.string().optional(),
    description: z.string().optional(),
    date: z.string().datetime().optional(),
    invoiceId: z.string().uuid().optional(),
    expenseId: z.string().uuid().optional(),
    contractId: z.string().uuid().optional(),
})

// record a manual payment (cash, check, bank transfer, etc)
export default async (req: Request, res: Response) => {
    try {
        const orgId = req.params.org_id
        const parsed = createPaymentSchema.safeParse(req.body)

        if (!parsed.success) {
            const fieldErrors = parsed.error.issues.map((i) => ({
                field: i.path.join('.'),
                message: i.message,
            }))
            return res
                .status(400)
                .json(
                    createErrorResponse(ErrorCode.VALIDATION_INVALID_VALUE, {
                        fields: fieldErrors,
                    })
                )
        }

        const body = parsed.data

        const result = await db.transaction(async (tx) => {
            // validate linked invoice belongs to this org
            if (body.invoiceId) {
                const invoice = await tx.query.invoices.findFirst({
                    where: and(
                        eq(invoices.id, body.invoiceId),
                        eq(invoices.organizationId, orgId)
                    ),
                })
                if (!invoice) {
                    return { error: ErrorCode.INVOICE_NOT_FOUND }
                }
                if (invoice.status === InvoiceStatus.Void) {
                    return { error: ErrorCode.INVOICE_INVALID_STATUS }
                }
            }

            // validate linked expense belongs to this org
            if (body.expenseId) {
                const expense = await tx.query.expenses.findFirst({
                    where: and(
                        eq(expenses.id, body.expenseId),
                        eq(expenses.organizationId, orgId)
                    ),
                })
                if (!expense) {
                    return { error: ErrorCode.EXPENSE_NOT_FOUND }
                }
            }

            const [payment] = await tx
                .insert(payments)
                .values({
                    type: body.type,
                    amount: String(body.amount),
                    method: body.method,
                    reference: body.reference,
                    description: body.description,
                    date: body.date ? new Date(body.date) : new Date(),
                    invoiceId: body.invoiceId,
                    expenseId: body.expenseId,
                    contractId: body.contractId,
                    organizationId: orgId,
                    recordedByUserId: (req as any).auth.id,
                })
                .returning()

            // if linked to an invoice, recalculate the balance and update status
            if (body.invoiceId) {
                const allPayments = await tx.query.payments.findMany({
                    where: and(
                        eq(payments.invoiceId, body.invoiceId),
                        eq(payments.organizationId, orgId)
                    ),
                })

                const totalPaid = allPayments.reduce(
                    (sum, p) => sum + Number(p.amount),
                    0
                )
                const invoice = await tx.query.invoices.findFirst({
                    where: eq(invoices.id, body.invoiceId),
                    with: { invoiceEntries: true },
                })

                if (invoice) {
                    let invoiceTotal = 0
                    for (const entry of invoice.invoiceEntries) {
                        invoiceTotal +=
                            (Number(entry.quantity) || 0) *
                            (Number(entry.unitCost) || 0)
                    }
                    const taxRate = Number(invoice.taxRate) || 0
                    invoiceTotal = invoiceTotal * (1 + taxRate / 100)

                    const newBalance = invoiceTotal - totalPaid
                    const newStatus =
                        newBalance <= 0
                            ? InvoiceStatus.Paid
                            : InvoiceStatus.Partial

                    await tx
                        .update(invoices)
                        .set({
                            balance: String(newBalance),
                            amount: String(invoiceTotal),
                            status: newStatus,
                            updatedAt: new Date(),
                        })
                        .where(eq(invoices.id, body.invoiceId))
                }
            }

            return { payment }
        })

        if ('error' in result) {
            return res
                .status(400)
                .json(createErrorResponse(result.error as ErrorCode))
        }

        return res.status(201).json(createSuccessResponse(result.payment))
    } catch (e: any) {
        return res
            .status(500)
            .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}
