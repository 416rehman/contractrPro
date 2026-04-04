export type tUser = {
  id?: string;
  name: string;
  username: string;
  email?: string;
  phoneCountry?: string;
  phoneNumber?: string;
  avatarUrl: string;
  flags?: object;
  createdAt?: string;
  updatedAt?: string;
  Organizations?: Organization[];
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
  currency: string;
  timezone: string;
  stripeAccountId?: string;
  stripeOnboarded?: boolean;
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
  id?: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  UpdatedByUserId?: string;
  OrganizationId?: string;
} & any;

export type Vendor = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  UpdatedByUserId?: string;
  OrganizationId?: string;
} & any;

export type Member = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  permissions: string;
  hourlyRate?: string;
  UserId?: string;
  createdAt?: string;
  updatedAt?: string;
  UpdatedByUserId?: string;
  OrganizationId?: string;
} & any;

export type Item = {
  key: string;
  name: string;
};

export type Invoice = {
  id?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  poNumber: string;
  note: string;
  taxRate: number;
  status: InvoiceStatusType;
  amount: number;
  balance: number;
  paymentUrl?: string;
  paymentToken?: string;
  stripePaymentIntentId?: string;
  BillToClientId?: string;
  ContractId?: string;
  JobId?: string;
  InvoiceEntries: Array<InvoiceEntry>;
  createdAt?: string;
  updatedAt?: string;
  UpdatedByUserId?: string;
  OrganizationId?: string;
} & any;

export type InvoiceStatusType =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'void';

export type Expense = {
  id?: string;
  description: string;
  date: string;
  expenseNumber: string;
  receiptUrl?: string;
  VendorId?: string;
  ContractId?: string;
  JobId?: string;
  taxRate: number;
  status: string;
  ExpenseEntries: Array<ExpenseEntry>;
  createdAt?: string;
  updatedAt?: string;
  UpdatedByUserId?: string;
  OrganizationId?: string;
} & any;

export type InvoiceEntry = {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  unitCost: number;
  InvoiceId?: string;
} & any;

export type ExpenseEntry = {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  unitCost: number;
  ExpenseId?: string;
} & any;

export type Contract = {
  id?: string;
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  completionDate: string;
  status: string;
  OrganizationId?: string;
  ClientId?: string;
  Jobs: Array<Job>;
  updatedAt?: string;
  UpdatedByUserId?: string;
  createdAt?: string;
};

export interface Job {
  id: string;
  reference?: string;
  name?: string;
  description?: string;
  status?: string;
  dueDate?: string;
  completionDate?: string;
  payout?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  ContractId?: string;
  UpdatedByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  JobMembers?: Array<JobMember>;
}

export interface JobMember {
  id?: string;
  JobId?: string;
  OrganizationMemberId?: string;
}

export type Payment = {
  id?: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  reference?: string;
  description?: string;
  date: string;
  stripePaymentIntentId?: string;
  invoiceId?: string;
  expenseId?: string;
  contractId?: string;
  organizationId?: string;
  recordedByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  invoice?: Invoice;
  expense?: Expense;
  contract?: Contract;
  recordedBy?: tUser;
};

export type TaxRate = {
  id?: string;
  name: string;
  rate: number;
  description?: string;
  isDefault?: boolean;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TimeEntry = {
  id?: string;
  hours: number;
  date: string;
  description?: string;
  jobId: string;
  organizationMemberId: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ContractProfitability = {
  contract: {
    id: string;
    name: string;
    status: string;
    client: Client | null;
  };
  revenue: {
    totalInvoiced: number;
    totalCollected: number;
    outstanding: number;
    invoiceCount: number;
  };
  costs: {
    totalExpenses: number;
    laborCost: number;
    totalCosts: number;
    expenseCount: number;
    totalHours: number;
  };
  profitability: {
    netProfit: number;
    margin: number;
    profitable: boolean;
  };
};

export type Attachment = {
  id?: string;
  name?: string;
  type?: string;
  size?: number;
  accessUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  CommentId?: string;
  markedForDeletion?: boolean;
};

export type Comment = {
  id?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  ClientId?: string;
  OrganizationId?: string;
  ContractId?: string;
  VendorId?: string;
  ExpenseId?: string;
  InvoiceId?: string;
  AuthorId?: string;
  UpdatedByUserId?: string;
  Attachments?: Array<Attachment | any>;
};

export type OrganizationSummary = {
  numOfVendors: number;
  numOfMembers: number;
  numOfExpenses: number;
  numOfInvoices: number;
  numOfPayments: number;
  expensesTotal: number;
  invoicesTotal: number;
  totalRevenue: number;
  totalCollected: number;
  netProfit: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  expensesTotalChangeSinceLastMonth: number;
  invoicesTotalChangeSinceLastMonth: number;
};

export type StripeStatus = {
  configured: boolean;
  onboarded: boolean;
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
};