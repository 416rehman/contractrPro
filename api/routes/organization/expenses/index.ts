import getExpenses from './getExpenses';
import createExpense from './createExpense';
import getExpense from './getExpense';
import updateExpense from './updateExpense';
import deleteExpense from './deleteExpense';
import expenseEntries from './expenseEntries';
import comments from './comments';
import { Router } from 'express';
import { authorizeOrg } from '../../../middleware/permissions';
import { OrgPermissions } from '../../../db/flags';

const routes = Router({ mergeParams: true })
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/expenses Get organization expenses
 */
routes.get('/', getExpenses)

/**
 * @api {post} /organizations/:org_id/expenses Add to organization
 */
routes.post('/', authorizeOrg(OrgPermissions.MANAGE_FINANCES), createExpense)

/**
 * @api {get} /organizations/:org_id/expenses/:expense_id Get organization expense
 */
routes.get('/:expense_id', getExpense)

/**
 * @api {put} /organizations/:org_id/expenses/:expense_id Update organization expense
 */
routes.put('/:expense_id', authorizeOrg(OrgPermissions.MANAGE_FINANCES), updateExpense)

/**
 * @api {delete} /organizations/:org_id/expenses/:expense_id Remove from organization
 */
routes.delete('/:expense_id', authorizeOrg(OrgPermissions.MANAGE_FINANCES), deleteExpense)

/**
 * @api {use} /organizations/:org_id/expenses/:expense_id/entries Expense entries
 */
routes.use('/:expense_id/entries', expenseEntries)

/**
 * @api {use} /organizations/:org_id/expenses/:expense_id/comments Expense comments
 */
routes.use('/:expense_id/comments', comments)

export default routes
