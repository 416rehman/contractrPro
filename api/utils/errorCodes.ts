// all error codes returned by the API - typed so we dont return arbitrary strings
export enum ErrorCode {
    // auth
    AUTH_USER_NOT_FOUND = 'auth.user_not_found',
    AUTH_INVALID_PASSWORD = 'auth.invalid_password',
    AUTH_MISSING_REFRESH_TOKEN = 'auth.missing_refresh_token',
    AUTH_ACCESS_TOKEN_INVALID = 'auth.access_token_invalid',
    AUTH_ACCESS_TOKEN_MISSING = 'auth.access_token_missing',
    AUTH_USERNAME_REQUIRED = 'auth.username_required',
    AUTH_PASSWORD_TOO_SHORT = 'auth.password_too_short',
    AUTH_EMAIL_REQUIRED = 'auth.email_required',
    AUTH_USER_BANNED = 'auth.user_banned',
    AUTH_UNAUTHORIZED = 'auth.unauthorized',
    AUTH_INVALID_TOKEN = 'auth.invalid_token',

    // validation
    VALIDATION_ORG_ID_REQUIRED = 'validation.org_id_required',
    VALIDATION_USER_ID_REQUIRED = 'validation.user_id_required',
    VALIDATION_INVALID_UUID = 'validation.invalid_uuid',
    VALIDATION_MISSING_TOKEN = 'validation.missing_token',
    VALIDATION_INVALID_TOKEN = 'validation.invalid_token',
    VALIDATION_FIELD_REQUIRED = 'validation.field_required',
    VALIDATION_FOREIGN_KEY = 'validation.invalid_reference',
    VALIDATION_NOT_NULL = 'validation.field_not_null',
    VALIDATION_INVALID_VALUE = 'validation.invalid_value',

    // invite
    INVITE_NOT_FOUND = 'invite.not_found',
    INVITE_EXPIRED = 'invite.expired',
    INVITE_MAX_USES = 'invite.max_uses_reached',
    INVITE_MEMBER_NOT_FOUND = 'invite.member_not_found',
    INVITE_ALREADY_JOINED = 'invite.already_joined',

    // resources
    RESOURCE_NOT_FOUND = 'resource.not_found',
    ROUTE_NOT_FOUND = 'route.not_found',
    ORG_NOT_FOUND = 'org.not_found',
    USER_NOT_FOUND = 'user.not_found',

    // rate limiting
    RATE_LIMIT_EXCEEDED = 'rate_limit.exceeded',

    // payments
    PAYMENT_NOT_FOUND = 'payment.not_found',
    PAYMENT_FAILED = 'payment.failed',
    PAYMENT_INVALID_AMOUNT = 'payment.invalid_amount',

    // invoices
    INVOICE_NOT_FOUND = 'invoice.not_found',
    INVOICE_ALREADY_PAID = 'invoice.already_paid',
    INVOICE_NOT_SENDABLE = 'invoice.not_sendable',
    INVOICE_INVALID_STATUS = 'invoice.invalid_status',

    // stripe
    STRIPE_NOT_CONFIGURED = 'stripe.not_configured',
    STRIPE_WEBHOOK_INVALID = 'stripe.webhook_invalid',
    STRIPE_ACCOUNT_NOT_ONBOARDED = 'stripe.account_not_onboarded',

    // tax rates
    TAX_RATE_NOT_FOUND = 'tax_rate.not_found',

    // time entries
    TIME_ENTRY_NOT_FOUND = 'time_entry.not_found',

    // expenses
    EXPENSE_NOT_FOUND = 'expense.not_found',

    // generic
    INTERNAL_ERROR = 'error.internal',
}
