"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getExpenseEntries_1 = __importDefault(require("./getExpenseEntries"));
const getExpenseEntry_1 = __importDefault(require("./getExpenseEntry"));
const createExpenseEntry_1 = __importDefault(require("./createExpenseEntry"));
const updateExpenseEntry_1 = __importDefault(require("./updateExpenseEntry"));
const deleteExpenseEntry_1 = __importDefault(require("./deleteExpenseEntry"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/expenses/:expense_id/entries Get organization expense entries
 */
routes.get('/', getExpenseEntries_1.default);
/**
 * @api {get} /organizations/:org_id/expenses/:expense_id/entries/:entry_id Get organization expense entry
 */
routes.get('/:entry_id', getExpenseEntry_1.default);
/**
 * @api {post} /organizations/:org_id/expenses/:expense_id/entries Add to organization
 */
routes.post('/', createExpenseEntry_1.default);
/**
 * @api {put} /organizations/:org_id/expenses/:expense_id/entries/:entry_id Update organization expense entry
 */
routes.put('/:entry_id', updateExpenseEntry_1.default);
/**
 * @api {delete} /organizations/:org_id/expenses/:expense_id/entries/:entry_id Remove from organization
 */
routes.delete('/:entry_id', deleteExpenseEntry_1.default);
exports.default = routes;
