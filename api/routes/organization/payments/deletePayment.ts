import { Request, Response } from 'express'
import { db, payments, invoices } from '../../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response'
import { ErrorCode } from '../../../utils/errorCodes'
import { eq, and } from 'drizzle-orm'
import { isValidUUID } from '../../../utils/isValidUUID'
import { InvoiceStatus } from '../../../db/enums'

// void/delete a payment and recalculate linked invoice balance
export default async (req: Request, res: Response) => {
    try {
        const orgId = req.params.org_id
        const paymentId = req.params.payment_id

        if (!paymentId || !isValidUUID(paymentId)) {
            return res
                .status(400)
                .json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        await db.transaction(async (tx) => {
            const payment = await tx.query.payments.findFirst({
                where: and(
                    eq(payments.id, paymentId),
                    eq(payments.organizationId, orgId)
                ),
            })

            if (!payment) {
                return res
                    .status(404)
                    .json(createErrorResponse(ErrorCode.PAYMENT_NOT_FOUND))
            }

            await tx.delete(payments).where(eq(payments.id, paymentId))

            // recalculate invoice balance after removing this payment
            if (payment.invoiceId) {
                const remainingPayments = await tx.query.payments.findMany({
                    where: and(
                        eq(payments.invoiceId, payment.invoiceId),
                        eq(payments.organizationId, orgId)
                    ),
                })

                const totalPaid = remainingPayments.reduce(
                    (sum, p) => sum + Number(p.amount),
                    0
                )
                const invoice = await tx.query.invoices.findFirst({
                    where: eq(invoices.id, payment.invoiceId),
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
                    let newStatus: string

                    if (totalPaid === 0) {
                        newStatus =
                            invoice.status === InvoiceStatus.Void
                                ? InvoiceStatus.Void
                                : InvoiceStatus.Sent
                    } else if (newBalance <= 0) {
                        newStatus = InvoiceStatus.Paid
                    } else {
                        newStatus = InvoiceStatus.Partial
                    }

                    await tx
                        .update(invoices)
                        .set({
                            balance: String(newBalance),
                            amount: String(invoiceTotal),
                            status: newStatus,
                            updatedAt: new Date(),
                        })
                        .where(eq(invoices.id, payment.invoiceId))
                }
            }

            return res
                .status(200)
                .json(createSuccessResponse({ deleted: true }))
        })
    } catch (e: any) {
        return res
            .status(500)
            .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}
