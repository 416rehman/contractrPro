"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUUID = void 0;
const isValidUUID = (uuid) => {
    if (uuid.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        return true;
    }
    else {
        return false;
    }
};
exports.isValidUUID = isValidUUID;
exports.default = { isValidUUID: exports.isValidUUID };
