"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getComments_1 = __importDefault(require("./getComments"));
const createComment_1 = __importDefault(require("./createComment"));
const updateComment_1 = __importDefault(require("./updateComment"));
const deleteComment_1 = __importDefault(require("./deleteComment"));
const attachments_1 = __importDefault(require("./attachments"));
const attachmentsMiddleware_1 = __importDefault(require("../../../../middleware/attachmentsMiddleware"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/comments Get organization contract comments
 */
routes.get('/', getComments_1.default);
/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/comments Add to organization contract
 */
routes.post('/', attachmentsMiddleware_1.default, createComment_1.default);
/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/comments/:comment_id Update organization contract comment
 */
routes.put('/:comment_id', attachmentsMiddleware_1.default, updateComment_1.default);
/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/comments/:comment_id Remove from organization contract
 */
routes.delete('/:comment_id', deleteComment_1.default);
/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/comments/:comment_id/attachments Comment attachments
 */
routes.use('/:comment_id/attachments', attachments_1.default);
exports.default = routes;
