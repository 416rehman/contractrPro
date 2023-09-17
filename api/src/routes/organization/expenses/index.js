const prisma = require('../../../prisma')
const { createErrorResponse } = require('../../../utils/response')
const routes = require('express').Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

const authorizeOrg = async (req, res, next) => {
    try {
        // Makes sure the client belongs to the organization
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

        if (!expenseId) {
            throw new Error('Invalid client id.')
        }

        if (!orgId) {
            throw new Error('Invalid organization id.')
        }

        const expense = await prisma.expense.findFirst({
            where: {
                id: expenseId,
                organizationId: orgId,
            },
        })

        if (!expense) {
            throw new Error('Expense not found.')
        }

        return next()
    } catch (error) {
        return res.status(403).json(createErrorResponse(error))
    }
}

/**
 * @api {get} /organizations/:org_id/expenses Get organization expenses
 */
routes.get('/', require('./getExpenses'))

/**
 * @api {post} /organizations/:org_id/expenses Add to organization
 */
routes.post('/', require('./createExpense'))

/**
 * @api {get} /organizations/:org_id/expenses/:expense_id Get organization expense
 */
routes.get('/:expense_id', authorizeOrg, require('./getExpense'))

/**
 * @api {put} /organizations/:org_id/expenses/:expense_id Update organization expense
 */
routes.put('/:expense_id', authorizeOrg, require('./updateExpense'))

/**
 * @api {delete} /organizations/:org_id/expenses/:expense_id Remove from organization
 */
routes.delete('/:expense_id', authorizeOrg, require('./deleteExpense'))

/**
 * @api {use} /organizations/:org_id/expenses/:expense_id/comments Expense comments
 */
routes.use('/:expense_id/comments', authorizeOrg, require('./comments'))

module.exports = routes