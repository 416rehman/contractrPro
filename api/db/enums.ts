export enum OrgMemberStatus {
    ActionRequired = 'action_required',
    Active = 'active',
    Suspended = 'suspended',
}

export enum OrgRole {
    // Owner has full access to the organization
    Owner = 'owner',
    // Manager are office admins, dispatchers, or project managers who run operations and finances
    Manager = 'manager',
    // Supervisor are field supervisors who oversee workers and subcontractors
    Supervisor = 'supervisor',
    // Worker are field workers who perform tasks and manage their own time
    Worker = 'worker',
    // Subcontractor are external contractors with limited access to specific jobs only
    Subcontractor = 'subcontractor',
}
