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
  userId: string,
} & any;