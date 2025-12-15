"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getExpenses_1 = __importDefault(require("./getExpenses"));
const createExpense_1 = __importDefault(require("./createExpense"));
const getExpense_1 = __importDefault(require("./getExpense"));
const updateExpense_1 = __importDefault(require("./updateExpense"));
const deleteExpense_1 = __importDefault(require("./deleteExpense"));
const expenseEntries_1 = __importDefault(require("./expenseEntries"));
const comments_1 = __importDefault(require("./comments"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/expenses Get organization expenses
 */
routes.get('/', getExpenses_1.default);
/**
 * @api {post} /organizations/:org_id/expenses Add to organization
 */
routes.post('/', createExpense_1.default);
/**
 * @api {get} /organizations/:org_id/expenses/:expense_id Get organization expense
 */
routes.get('/:expense_id', getExpense_1.default);
/**
 * @api {put} /organizations/:org_id/expenses/:expense_id Update organization expense
 */
routes.put('/:expense_id', updateExpense_1.default);
/**
 * @api {delete} /organizations/:org_id/expenses/:expense_id Remove from organization
 */
routes.delete('/:expense_id', deleteExpense_1.default);
/**
 * @api {use} /organizations/:org_id/expenses/:expense_id/entries Expense entries
 */
routes.use('/:expense_id/entries', expenseEntries_1.default);
/**
 * @api {use} /organizations/:org_id/expenses/:expense_id/comments Expense comments
 */
routes.use('/:expense_id/comments', comments_1.default);
exports.default = routes;
