"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meHandler = (req, res, next) => {
    if (req.params.user_id === 'me' ||
        req.params.user_id === '@me' ||
        req.params.user_id === 'me/') {
        req.params.user_id = req.auth.id;
    }
    next();
};
exports.default = meHandler;
