"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getBlob_1 = __importDefault(require("./getBlob"));
const express_1 = require("express");
const routes = (0, express_1.Router)({ mergeParams: true });
routes.get('/:blob_id', getBlob_1.default);
exports.default = routes;
