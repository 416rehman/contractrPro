"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteAttachment_1 = __importDefault(require("./deleteAttachment"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
/**
 * @api {delete} /organizations/:org_id/jobs/:job_id/comments/:comment_id/attachments/:attachment_id Delete a comment attachment
 */
routes.delete('/:attachment_id', deleteAttachment_1.default);
exports.default = routes;
