export const isValidUUID = (uuid: string) => {
    if (
        uuid.match(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
        )
    ) {
        return true;
    } else {
        return false;
    }
};

export default { isValidUUID };
