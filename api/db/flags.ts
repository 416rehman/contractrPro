export const tokenFlags = {
    USER_EMAIL_VERIFY_TOKEN: 1,
    USER_PHONE_VERIFY_TOKEN: 2,
    USER_PASSWORD_RESET_TOKEN: 4,
    ORG_DELETE_TOKEN: 8,
    USER_ACCOUNT_DELETE_TOKEN: 16,
};

export const UserFlags = {
    VERIFIED_EMAIL: 1,
    VERIFIED_PHONE: 2,
};

export const OrgPermissions = {
    VIEW_ORG: 1n << 0n,
    EDIT_ORG: 1n << 1n,
    DELETE_ORG: 1n << 2n,
    MANAGE_MEMBERS: 1n << 3n,
    MANAGE_CLIENTS: 1n << 4n,
    MANAGE_CONTRACTS: 1n << 5n,
    MANAGE_JOBS: 1n << 6n,
    MANAGE_FINANCES: 1n << 7n,
    VIEW_FINANCES: 1n << 8n,
    MANAGE_VENDORS: 1n << 9n,
    ADMINISTRATOR: 1n << 60n, // High bit for "All Permissions"
};
