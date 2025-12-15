"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../utils/response");
const db_1 = require("../../db");
const utils_1 = require("../../utils");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.default = async (req, res) => {
    const body = (0, utils_1.pick)(req.body, [
        'username',
        'password',
        'email',
        'name',
        'phoneCountry',
        'phoneNumber',
        'avatarUrl',
    ]);
    if (!body.username) {
        return res.status(400).json((0, response_1.createErrorResponse)('Username is required'));
    }
    if (!body.password || body.password.length < 6) {
        return res
            .status(400)
            .json((0, response_1.createErrorResponse)('Password must be at least 6 characters'));
    }
    if (!body.email) {
        return res.status(400).json((0, response_1.createErrorResponse)('Email is required'));
    }
    try {
        const hashedPassword = await bcrypt_1.default.hash(body.password, 10);
        await db_1.db.transaction(async (tx) => {
            const [newUser] = await tx.insert(db_1.users).values({
                ...body,
                password: hashedPassword,
                // UpdatedByUserId: self (not in schema yet? assumed automatic or irrelevant)
            }).returning();
            if (newUser && newUser.password) {
                // manually remove password from response object if needed
                newUser.password = undefined;
            }
            return res.status(201).json((0, response_1.createSuccessResponse)(newUser));
        });
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
