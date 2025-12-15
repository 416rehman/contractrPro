export const isFlagSet = (bitmask: number, flag: number) => {
    return (flag & bitmask) !== 0;
};

export const setFlag = (bitmask: number, flag: number) => {
    return flag | bitmask;
};

export const unsetFlag = (bitmask: number, flag: number) => {
    return bitmask & ~flag;
};

export const setOnlyFlag = (bitmask: number, flag: number) => {
    const unsetFlags = ~bitmask;
    return flag & unsetFlags;
};

export const readFlags = (bitmask: number, flagsObject: any) => {
    const result: any = {};
    for (const key in flagsObject) {
        result[key] = isFlagSet(flagsObject[key], bitmask);
    }
    return result;
};

export default {
    isFlagSet,
    setFlag,
    unsetFlag,
    setOnlyFlag,
    readFlags,
};
