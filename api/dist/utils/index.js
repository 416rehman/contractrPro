"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pick = exports.signJWT = exports.isValidInviteCode = exports.generateRandomCode = exports.generateRefreshToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * @returns {string} - Returns a random refresh token
 */
const generateRefreshToken = function () {
    return crypto_1.default.randomBytes(64).toString('hex');
};
exports.generateRefreshToken = generateRefreshToken;
// generates a random alphanumeric string of specified length (default 8)
const generateRandomCode = function (length = 8) {
    return crypto_1.default.randomBytes(length / 2).toString('hex');
};
exports.generateRandomCode = generateRandomCode;
// Checks if a string is an 8 character alphanumeric string
const isValidInviteCode = function (inviteCode) {
    return /^[a-z0-9]{8}$/i.test(inviteCode);
};
exports.isValidInviteCode = isValidInviteCode;
/**
 * @param {object} payload
 * @param {string} secret
 * @returns {Promise<String>} The JWT token
 */
const signJWT = function (payload, secret) {
    return new Promise((resolve, reject) => {
        try {
            //15 minutes
            jsonwebtoken_1.default.sign(payload, secret, { expiresIn: 15 * 60 }, (err, token) => {
                if (err)
                    reject(err);
                else
                    resolve(token);
            });
        }
        catch (e) {
            reject(e);
        }
    });
};
exports.signJWT = signJWT;
/**
 * Pick - returns an object with only the specified fields
 * @param {object} obj - The object to pick from
 * @param {string[]} fields - The fields to pick
 */
const pick = (obj, fields) => {
    const picked = {};
    for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(obj, field)) {
            picked[field] = obj[field];
            // if it can be trimmed, trim it
            if (typeof picked[field] === 'string') {
                picked[field] = picked[field].trim();
            }
        }
    }
    return picked;
};
exports.pick = pick;
