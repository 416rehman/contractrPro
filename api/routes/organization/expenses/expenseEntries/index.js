const routes = require('express').Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/expenses/:expense_id/entries Get organization expense entries
 */
routes.get('/', require('./getExpenseEntries'))

/**
 * @api {get} /organizations/:org_id/expenses/:expense_id/entries/:entry_id Get organization expense entry
 */
routes.get('/:entry_id', require('./getExpenseEntry'))

/**
 * @api {post} /organizations/:org_id/expenses/:expense_id/entries Add to organization
 */
routes.post('/', require('./createExpenseEntry'))

/**
 * @api {put} /organizations/:org_id/expenses/:expense_id/entries/:entry_id Update organization expense entry
 */
routes.put('/:entry_id', require('./updateExpenseEntry'))

/**
 * @api {delete} /organizations/:org_id/expenses/:expense_id/entries/:entry_id Remove from organization
 */
routes.delete('/:entry_id', require('./deleteExpenseEntry'))

module.exports = routes
