import { faker as fakerJs } from '@faker-js/faker'
import { v4 as uuidv4 } from 'uuid'

export const mockUserData = (overrides = {}) => ({
    name: fakerJs.person.fullName(),
    username: fakerJs.internet.username().toLowerCase().replace(/[^a-z0-9]/g, '') + uuidv4().substring(0, 5),
    email: fakerJs.internet.email().toLowerCase(),
    password: 'Password123!',
    phone: fakerJs.phone.number({ style: 'international' }),
    avatarUrl: fakerJs.image.avatar(),
    phoneCountry: 'US',
    phoneNumber: fakerJs.phone.number({ style: 'national' }),
    ...overrides,
})

export const mockOrganizationData = (overrides = {}) => ({
    name: fakerJs.company.name(),
    type: 'construction',
    taxId: fakerJs.finance.accountNumber(),
    timezone: 'UTC',
    currency: 'USD',
    ...overrides,
})

export const mockMemberData = (overrides = {}) => ({
    role: 'admin',
    status: 'active',
    name: fakerJs.person.fullName(),
    email: fakerJs.internet.email().toLowerCase(),
    phone: fakerJs.phone.number({ style: 'international' }),
    ...overrides,
})

export const mockClientData = (overrides = {}) => ({
    name: fakerJs.company.name(),
    phone: fakerJs.phone.number({ style: 'international' }),
    email: fakerJs.internet.email().toLowerCase(),
    website: fakerJs.internet.url(),
    description: fakerJs.lorem.sentence(),
    ...overrides,
})

export const mockVendorData = (overrides = {}) => ({
    name: fakerJs.company.name(),
    phone: fakerJs.phone.number({ style: 'international' }),
    email: fakerJs.internet.email().toLowerCase(),
    website: fakerJs.internet.url(),
    description: fakerJs.lorem.sentence(),
    ...overrides,
})

export const mockContractData = (overrides = {}) => ({
    name: fakerJs.commerce.productName() + ' Renovation',
    description: fakerJs.lorem.paragraph(),
    status: 'draft',
    startDate: new Date(),
    ...overrides,
})

export const faker = fakerJs

