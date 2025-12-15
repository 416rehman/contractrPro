"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUsers_1 = __importDefault(require("./getUsers"));
const getOrganizations_1 = __importDefault(require("./getOrganizations"));
const updateUsers_1 = __importDefault(require("./updateUsers"));
const express_1 = require("express");
const routes = (0, express_1.Router)();
// /admin/users - Retrieves all users in the system
routes.get('/users', getUsers_1.default);
// /admin/organizations - Retrieves all organizations in the system
routes.get('/organizations', getOrganizations_1.default);
// /admin/users
routes.put('/users', updateUsers_1.default);
exports.default = routes;
