import { db, vendors, expenses, invoices, organizationMembers } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/summary:
 *   get:
 *     summary: Get organization summary statistics
 *     tags: [Summary]
 *     responses:
 *       200:
 *         description: Summary statistics
 */
export default async (req, res) => {
    const orgId = req.params.org_id

    if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))

    const summaryObj = {
        numOfVendors: 0, numOfMembers: 0, numOfExpenses: 0, numOfInvoices: 0,
        expensesTotal: 0, invoicesTotal: 0, expensesTotalChangeSinceLastMonth: 0, invoicesTotalChangeSinceLastMonth: 0,
    }

    try {
        await db.transaction(async (tx) => {
            const vendorsList = await tx.query.vendors.findMany({ where: eq(vendors.organizationId, orgId) })
            summaryObj.numOfVendors = vendorsList.length

            const membersList = await tx.query.organizationMembers.findMany({ where: eq(organizationMembers.organizationId, orgId) })
            summaryObj.numOfMembers = membersList.length

            const expensesList = await tx.query.expenses.findMany({ where: eq(expenses.organizationId, orgId), with: { expenseEntries: true } })
            summaryObj.numOfExpenses = expensesList.length

            expensesList.forEach((expense) => {
                let expenseTotal = 0
                expense.expenseEntries.forEach((entry) => { expenseTotal += (Number(entry.quantity) || 0) * (Number(entry.unitCost) || 0) })
                const taxRate = Number(expense.taxRate) || 0;
                expenseTotal = expenseTotal * (1 + taxRate / 100)
                summaryObj.expensesTotal += expenseTotal
            })

            const invoicesList = await tx.query.invoices.findMany({ where: eq(invoices.organizationId, orgId), with: { invoiceEntries: true } })
            summaryObj.numOfInvoices = invoicesList.length

            invoicesList.forEach((invoice) => {
                let invoiceTotal = 0
                invoice.invoiceEntries.forEach((entry) => { invoiceTotal += (Number(entry.quantity) || 0) * (Number(entry.unitCost) || 0) })
                const taxRate = Number(invoice.taxRate) || 0;
                invoiceTotal = invoiceTotal * (1 + taxRate / 100)
                summaryObj.invoicesTotal += invoiceTotal
            })

            const lastMonthExpenses = expensesList.filter((expense) => {
                const expenseDate = new Date(expense.date)
                const currentDate = new Date(); const lastMonthDate = new Date(currentDate); lastMonthDate.setMonth(currentDate.getMonth() - 1);
                return expenseDate >= lastMonthDate;
            })

            lastMonthExpenses.forEach((expense) => {
                let expenseTotal = 0
                expense.expenseEntries.forEach((entry) => { expenseTotal += (Number(entry.quantity) || 0) * (Number(entry.unitCost) || 0) })
                const taxRate = Number(expense.taxRate) || 0; expenseTotal = expenseTotal * (1 + taxRate / 100)
                summaryObj.expensesTotalChangeSinceLastMonth += expenseTotal
            })

            const lastMonthInvoices = invoicesList.filter((invoice) => {
                const invoiceDate = new Date(invoice.issueDate)
                const currentDate = new Date(); const lastMonthDate = new Date(currentDate); lastMonthDate.setMonth(currentDate.getMonth() - 1);
                return invoiceDate >= lastMonthDate;
            })

            lastMonthInvoices.forEach((invoice) => {
                let invoiceTotal = 0
                invoice.invoiceEntries.forEach((entry) => { invoiceTotal += (Number(entry.quantity) || 0) * (Number(entry.unitCost) || 0) })
                const taxRate = Number(invoice.taxRate) || 0; invoiceTotal = invoiceTotal * (1 + taxRate / 100)
                summaryObj.invoicesTotalChangeSinceLastMonth += invoiceTotal
            })

            return res.status(200).json(createSuccessResponse(summaryObj))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}
