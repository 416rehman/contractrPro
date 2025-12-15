"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../utils/response");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const adminMiddleware_1 = __importDefault(require("../middleware/adminMiddleware"));
const auth_1 = __importDefault(require("./auth"));
const confirm_1 = __importDefault(require("./confirm"));
const user_1 = __importDefault(require("./user"));
const organization_1 = __importDefault(require("./organization"));
const join_1 = __importDefault(require("./join"));
const admin_1 = __importDefault(require("./admin"));
const routes = (0, express_1.Router)();
routes.use((req, res, next) => {
    // @ts-ignore
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
    res.set('Router', path);
    next();
});
routes.get('/', (req, res) => {
    res.json((0, response_1.createSuccessResponse)('Connected'));
});
routes.use('/auth', auth_1.default);
routes.post('/confirm', confirm_1.default);
routes.use('/users', authMiddleware_1.default, user_1.default);
routes.use('/organizations', authMiddleware_1.default, organization_1.default);
routes.use('/join', authMiddleware_1.default, join_1.default);
routes.use('/admin', adminMiddleware_1.default, admin_1.default);
exports.default = routes;
