export enum OrgMemberStatus {
    ActionRequired = 'action_required',
    Active = 'active',
    Suspended = 'suspended',
}

export enum OrgRole {
    // full access to the organization
    Owner = 'owner',
    // office admins, dispatchers, project managers who run operations and finances
    Manager = 'manager',
    // field supervisors who oversee workers and subcontractors
    Supervisor = 'supervisor',
    // field workers who perform tasks and manage their own time
    Worker = 'worker',
    // external contractors with limited access to specific jobs only
    Subcontractor = 'subcontractor',
}

export enum InvoiceStatus {
    Draft = 'draft',
    Sent = 'sent',
    Viewed = 'viewed',
    Partial = 'partial',
    Paid = 'paid',
    Overdue = 'overdue',
    Void = 'void',
}

export enum PaymentType {
    Deposit = 'deposit',
    Withdrawal = 'withdrawal',
}

export enum PaymentMethod {
    Cash = 'cash',
    Check = 'check',
    Card = 'card',
    BankTransfer = 'bank_transfer',
    Stripe = 'stripe',
    Other = 'other',
}

export enum ExpenseStatus {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected',
    Paid = 'paid',
}

export enum ContractStatus {
    Draft = 'draft',
    Active = 'active',
    Completed = 'completed',
    Cancelled = 'cancelled',
    OnHold = 'on_hold',
}

export enum JobStatus {
    Pending = 'pending',
    InProgress = 'in_progress',
    Completed = 'completed',
    Cancelled = 'cancelled',
    OnHold = 'on_hold',
}
