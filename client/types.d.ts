export type tUser = {
  id?: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  avatarUrl: string;
  flags?: object;
  createdAt?: string;
  updatedAt?: string;
} & any;

export type UserAccount = tUser & {
  refreshToken: string;
} & any;

export type Organization = {
  id?: string;
  name: string;
  description: string;
  email: string;
  website: string;
  phone: string;
  logoUrl: string;
  Address: Address | null;
} & any;

export type Address = {
  id?: string;
  province: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  country: string;
  city: string;
} & any;

export type Client = {
  id?: string,
  name: string,
  phone: string,
  email: string,
  website: string,
  description: string,
  createdAt?: string,
  updatedAt?: string,
  UpdatedByUserId?: string,
  OrganizationId?: string,
} & any;

export type Employee = {
  id?: string,
  name: string,
  email: string,
  phone: string,
  permissions: string,
  UserId?: string,
  createdAt?: string,
  updatedAt?: string,
  UpdatedByUserId?: string,
  OrganizationId?: string,
} & any;

export type Item = {
  key: string,
  name: string,
}

export type Invoice = {
  id?: string,
  invoiceNumber: string,
  issueDate: string,
  dueDate: string,
  poNumber: string,
  note: string,
  taxRate: number,
  BillToClientId?: string,
  ContractId?: string,
  JobId?: string,
  InvoiceEntries: Array<InvoiceEntry>,
  createdAt?: string,
  updatedAt?: string,
  UpdatedByUserId?: string,
  OrganizationId?: string,
} & any;

export type Expense = {
  id?: string,
  description: string,
  date: string,
  VendorId?: string,
  ContractId?: string,
  JobId?: string,
  ExpenseEntries: Array<ExpenseEntry>,
  createdAt?: string,
  updatedAt?: string,
  UpdatedByUserId?: string,
  OrganizationId?: string,
} & any;

export type InvoiceEntry = {
  id?: string,
  name: string,
  description: string,
  quantity: number,
  unitCost: number,
  InvoiceId?: string,
} & any;


export type ExpenseEntry = {
  id?: string,
  name: string,
  description: string,
  quantity: number,
  unitCost: number,
  ExpenseId?: string,
} & any;

export type OrgMember = {
  id?: string,
  name: string,
  email?: string,
  phone?: string,
  UpdatedByUserId?: string,
  OrganizationId?: string,  // the organization that this member belongs to
  UserId?: string,  // the user associated with this member
}

type Contract = {
  id?: string,
  name: string,
  description: string,
  startDate: string,
  dueDate: string,
  completionDate: string,
  status: EContractStatus,
  OrganizationId?: string, // the organization that owns this contract
  ClientId?: string, // the client that this contract is for
  Jobs: Array<Job>,
  updatedAt?: string,
  UpdatedByUserId?: string,
  createdAt?: string,
}

interface Job {
  id: string,
  reference?: string,
  name?: string,
  description?: string,
  status?: EJobStatus,
  dueDate?: string,
  completionDate?: string,
  payout?: number,  // the amount that the client will pay for this job
  ContractId?: string,  // the contract that this job is associated with
  UpdatedByUserId?: string,
  createdAt?: string,
  updatedAt?: string,
  JobMembers?: Array<JobMember>,
}

interface JobMember {
  id?: string,
  JobId?: string,
  OrganizationMemberId?: string,
}