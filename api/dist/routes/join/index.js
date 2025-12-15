"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joinOrganization_1 = __importDefault(require("./joinOrganization"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
/**
 * @api {post} /join/:invite_id Join organization by invite
 */
routes.post('/:invite_id', joinOrganization_1.default);
exports.default = routes;
