const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Get an organizations summary
module.exports = async (req, res) => {
    const orgId = req.params.org_id

    if (!orgId) throw new Error('Organization ID required')

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
        // const vendors = await Vendor.findAll({
        //   where: {
        //     OrganizationId: orgId
        //   },
        //   transaction
        // });

        const vendors = await prisma.vendor.findMany({
            where: {
                organizationId: orgId,
            },
        })

        summaryObj.numOfVendors = vendors.length

        // const members = await OrganizationMember.findAll({
        //   where: {
        //     OrganizationId: orgId
        //   },
        //   transaction
        // });

        const members = await prisma.organizationMember.findMany({
            where: {
                organizationId: orgId,
            },
        })

        summaryObj.numOfMembers = members.length

        const expenses = await prisma.expense.findMany({
            where: {
                organizationId: orgId,
            },
            include: {
                ExpenseEntries: true,
            },
        })

        summaryObj.numOfExpenses = expenses.length

        expenses.forEach((expense) => {
            let expenseTotal = 0
            expense.ExpenseEntries.forEach((entry) => {
                expenseTotal += entry.quantity * entry.unitPrice
            })
            expenseTotal = expenseTotal * (1 + expense.taxRate / 100)
            summaryObj.expensesTotal += expenseTotal
        })

        // const invoices = await Invoice.findAll({
        //     where: {
        //         OrganizationId: orgId,
        //     },
        //     include: [
        //         {
        //             model: InvoiceEntry,
        //         },
        //     ],
        //     transaction,
        // })

        const invoices = await prisma.invoice.findMany({
            where: {
                organizationId: orgId,
            },
            include: {
                InvoiceEntries: true,
            },
        })

        summaryObj.numOfInvoices = invoices.length

        invoices.forEach((invoice) => {
            let invoiceTotal = 0
            invoice.InvoiceEntries.forEach((entry) => {
                invoiceTotal += entry.quantity * entry.unitPrice
            })
            invoiceTotal = invoiceTotal * (1 + invoice.taxRate / 100)
            summaryObj.invoicesTotal += invoiceTotal
        })

        const lastMonthExpenses = expenses.filter((expense) => {
            const expenseDate = new Date(expense.date)
            const currentDate = new Date()
            const lastMonth = currentDate.setMonth(currentDate.getMonth() - 1)
            return expenseDate >= lastMonth
        })

        lastMonthExpenses.forEach((expense) => {
            let expenseTotal = 0
            expense.ExpenseEntries.forEach((entry) => {
                expenseTotal += entry.quantity * entry.unitPrice
            })
            expenseTotal = expenseTotal * (1 + expense.taxRate)
            summaryObj.expensesTotalChangeSinceLastMonth += expenseTotal
        })

        const lastMonthInvoices = invoices.filter((invoice) => {
            const invoiceDate = new Date(invoice.issueDate)
            const currentDate = new Date()
            const lastMonth = currentDate.setMonth(currentDate.getMonth() - 1)
            return invoiceDate >= lastMonth
        })

        lastMonthInvoices.forEach((invoice) => {
            let invoiceTotal = 0
            invoice.InvoiceEntries.forEach((entry) => {
                invoiceTotal += entry.quantity * entry.unitPrice
            })
            invoiceTotal = invoiceTotal * (1 + invoice.taxRate)
            summaryObj.invoicesTotalChangeSinceLastMonth += invoiceTotal
        })

        return res.status(200).json(createSuccessResponse(summaryObj))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}