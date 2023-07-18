enum EStatus {
  OPEN,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED
}

interface Job {
  id: string,
  identifier?: string,
  name?: string,
  description?: string,
  status?: EStatus
}

export type tUser = {
  id?: string;
  name: string;
  username: string;
  email?: string;
  avatarUrl: string;
  flags?: object;
  createdAt?: string;
  updatedAt?: string;
} & any;

export type UserAccount = tUser & {
  refreshToken: string;
} & any;

type Organization = {
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

type Client = {
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

type Employee = {
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

type Item = {
  key: string,
  name: string,
}

type Invoice = {
  id?: string,
  invoiceNumber: string,
  date: string,
  dueDate: string,
  poNumber: string,
  note: string,
  taxRate: string,
  BillToClientId?: string,
  ContractId?: string,
  JobId?: string,
  InvoiceEntries: string,
  createdAt?: string, 
  updatedAt?: string,
  UpdatedByUserId?: string,
  OrganizationId?: string,
} & any;

type Expense = {
  id?: string,
  description: string,
  date: string,
  VendorId?: string,
  ContractId?: string,
  JobId?: string,
  ExpenseEntries: string,
  createdAt?: string, 
  updatedAt?: string,
  UpdatedByUserId?: string,
  OrganizationId?: string,
} & any;

type InvoiceEntry = {
  id?: string,
  name: string,
  description: string,
  quantity: string,
  unitCost: string,
  InvoiceId?: string,
} & any;


type ExpenseEntry = {
  id?: string,
  name: string,
  description: string,
  quantity: string,
  unitCost: string,
  ExpenseId?: string,
} & any;