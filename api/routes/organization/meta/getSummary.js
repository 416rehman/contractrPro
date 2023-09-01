const {
    sequelize,
    Vendor,
    Expense,
    ExpenseEntry,
    InvoiceEntry,
    Invoice,
    OrganizationMember,
} = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Get an organizations summary
module.exports = async (req, res) => {
    const orgId = req.params.org_id

    if (!orgId || !isValidUUID(orgId)) {
        return res
            .status(400)
            .json(createErrorResponse('Organization ID is required'))
    }

    const summaryObj = {
        numOfVendors: 0,
        numOfMembers: 0,
        numOfExpenses: 0,
        numOfInvoices: 0,
        expensesTotal: 0,
        invoicesTotal: 0,
        expensesTotalChangeSinceLastMonth: 0,
        invoicesTotalChangeSinceLastMonth: 0,
    }

    try {
        await sequelize.transaction(async (transaction) => {
            const vendors = await Vendor.findAll({
                where: {
                    OrganizationId: orgId,
                },
                transaction,
            })

            summaryObj.numOfVendors = vendors.length

            const members = await OrganizationMember.findAll({
                where: {
                    OrganizationId: orgId,
                },
                transaction,
            })

            summaryObj.numOfMembers = members.length

            const expenses = await Expense.findAll({
                where: {
                    OrganizationId: orgId,
                },
                include: [
                    {
                        model: ExpenseEntry,
                    },
                ],
                transaction,
            })

            summaryObj.numOfExpenses = expenses.length

            expenses.forEach((expense) => {
                let expenseTotal = 0
                expense.ExpenseEntries.forEach((entry) => {
                    expenseTotal += entry.quantity * entry.unitCost
                })
                expenseTotal = expenseTotal * (1 + expense.taxRate / 100)
                summaryObj.expensesTotal += expenseTotal
            })

            const invoices = await Invoice.findAll({
                where: {
                    OrganizationId: orgId,
                },
                include: [
                    {
                        model: InvoiceEntry,
                    },
                ],
                transaction,
            })

            summaryObj.numOfInvoices = invoices.length

            invoices.forEach((invoice) => {
                let invoiceTotal = 0
                invoice.InvoiceEntries.forEach((entry) => {
                    invoiceTotal += entry.quantity * entry.unitCost
                })
                invoiceTotal = invoiceTotal * (1 + invoice.taxRate / 100)
                summaryObj.invoicesTotal += invoiceTotal
            })

            const lastMonthExpenses = expenses.filter((expense) => {
                const expenseDate = new Date(expense.date)
                const currentDate = new Date()
                const lastMonth = currentDate.setMonth(
                    currentDate.getMonth() - 1
                )
                return expenseDate >= lastMonth
            })

            lastMonthExpenses.forEach((expense) => {
                let expenseTotal = 0
                expense.ExpenseEntries.forEach((entry) => {
                    expenseTotal += entry.quantity * entry.unitCost
                })
                expenseTotal = expenseTotal * (1 + expense.taxRate)
                summaryObj.expensesTotalChangeSinceLastMonth += expenseTotal
            })

            const lastMonthInvoices = invoices.filter((invoice) => {
                const invoiceDate = new Date(invoice.issueDate)
                const currentDate = new Date()
                const lastMonth = currentDate.setMonth(
                    currentDate.getMonth() - 1
                )
                return invoiceDate >= lastMonth
            })

            lastMonthInvoices.forEach((invoice) => {
                let invoiceTotal = 0
                invoice.InvoiceEntries.forEach((entry) => {
                    invoiceTotal += entry.quantity * entry.unitCost
                })
                invoiceTotal = invoiceTotal * (1 + invoice.taxRate)
                summaryObj.invoicesTotalChangeSinceLastMonth += invoiceTotal
            })

            return res.status(200).json(createSuccessResponse(summaryObj))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
