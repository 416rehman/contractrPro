"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFlags = exports.setOnlyFlag = exports.unsetFlag = exports.setFlag = exports.isFlagSet = void 0;
const isFlagSet = (bitmask, flag) => {
    return (flag & bitmask) !== 0;
};
exports.isFlagSet = isFlagSet;
const setFlag = (bitmask, flag) => {
    return flag | bitmask;
};
exports.setFlag = setFlag;
const unsetFlag = (bitmask, flag) => {
    return bitmask & ~flag;
};
exports.unsetFlag = unsetFlag;
const setOnlyFlag = (bitmask, flag) => {
    const unsetFlags = ~bitmask;
    return flag & unsetFlags;
};
exports.setOnlyFlag = setOnlyFlag;
const readFlags = (bitmask, flagsObject) => {
    const result = {};
    for (const key in flagsObject) {
        result[key] = (0, exports.isFlagSet)(flagsObject[key], bitmask);
    }
    return result;
};
exports.readFlags = readFlags;
exports.default = {
    isFlagSet: exports.isFlagSet,
    setFlag: exports.setFlag,
    unsetFlag: exports.unsetFlag,
    setOnlyFlag: exports.setOnlyFlag,
    readFlags: exports.readFlags,
};
