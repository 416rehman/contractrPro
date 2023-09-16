const routes = require('express').Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

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
routes.get('/:expense_id', require('./getExpense'))

/**
 * @api {put} /organizations/:org_id/expenses/:expense_id Update organization expense
 */
routes.put('/:expense_id', require('./updateExpense'))

/**
 * @api {delete} /organizations/:org_id/expenses/:expense_id Remove from organization
 */
routes.delete('/:expense_id', require('./deleteExpense'))

/**
 * @api {use} /organizations/:org_id/expenses/:expense_id/entries Expense entries
 */
routes.use('/:expense_id/entries', require('./expenseEntries'))

/**
 * @api {use} /organizations/:org_id/expenses/:expense_id/comments Expense comments
 */
routes.use('/:expense_id/comments', require('./comments'))

module.exports = routes
