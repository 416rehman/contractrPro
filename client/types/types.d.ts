enum EStatus {
  OPEN,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED
}

type Organization = {
  name: string;
  description: string;
  email: string;
  phone: string;
  logoUrl: string;
  Address: Address | null;
}

export type tUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  flags: object;
  createdAt: string;
  updatedAt: string;
} & { [key: string]: any }

export type Address = {
  province: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  country: string;
  city: string;
} & { [key: string]: any }

interface Job {
  id: string,
  identifier?: string,
  name?: string,
  description?: string,
  status?: EStatus
}