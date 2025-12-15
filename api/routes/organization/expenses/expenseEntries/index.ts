import getExpenseEntries from './getExpenseEntries';
import getExpenseEntry from './getExpenseEntry';
import createExpenseEntry from './createExpenseEntry';
import updateExpenseEntry from './updateExpenseEntry';
import deleteExpenseEntry from './deleteExpenseEntry';
import { Router } from 'express';
const routes = Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/expenses/:expense_id/entries Get organization expense entries
 */
routes.get('/', getExpenseEntries)

/**
 * @api {get} /organizations/:org_id/expenses/:expense_id/entries/:entry_id Get organization expense entry
 */
routes.get('/:entry_id', getExpenseEntry)

/**
 * @api {post} /organizations/:org_id/expenses/:expense_id/entries Add to organization
 */
routes.post('/', createExpenseEntry)

/**
 * @api {put} /organizations/:org_id/expenses/:expense_id/entries/:entry_id Update organization expense entry
 */
routes.put('/:entry_id', updateExpenseEntry)

/**
 * @api {delete} /organizations/:org_id/expenses/:expense_id/entries/:entry_id Remove from organization
 */
routes.delete('/:entry_id', deleteExpenseEntry)

export default routes
