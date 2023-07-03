const request = require('supertest')
const app = require('../../../../server')
const { Organization, sequelize } = require('../../../../db')

let orgId

beforeAll(async () => {
    const orgResuts = await Organization.findAll()
    orgId = orgResuts[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Get all organization invoices', () => {
    it('should return all organization invoices with expanded InvoiceEntries', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/invoices?expand=true`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(Array.isArray(data)).toBe(true)
        expect(data.length).toBeGreaterThan(0)

        const invoice = data[0]
        expect(invoice).toHaveProperty('id')
        expect(invoice).toHaveProperty('invoiceNumber')
        expect(invoice).toHaveProperty('date')
        expect(invoice).toHaveProperty('createdAt')
        expect(invoice).toHaveProperty('updatedAt')
        expect(invoice).toHaveProperty('ContractId')
        expect(invoice).toHaveProperty('OrganizationId', orgId)
        expect(invoice).toHaveProperty('JobId')
        expect(invoice).toHaveProperty('BillToClientId')
        expect(invoice).toHaveProperty('UpdatedByUserId')

        expect(Array.isArray(invoice.InvoiceEntries)).toBe(true)
        expect(invoice.InvoiceEntries.length).toBeGreaterThan(0)

        const invoiceEntry = invoice.InvoiceEntries[0]
        expect(invoiceEntry).toHaveProperty('id')
        expect(invoiceEntry).toHaveProperty('name')
        expect(invoiceEntry).toHaveProperty('description')
        expect(invoiceEntry).toHaveProperty('quantity')
        expect(invoiceEntry).toHaveProperty('unitCost')
        expect(invoiceEntry).toHaveProperty('createdAt')
        expect(invoiceEntry).toHaveProperty('updatedAt')
        expect(invoiceEntry).toHaveProperty('InvoiceId', invoice.id)
    })

    it('should return all organization invoices without expanded InvoiceEntries', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/invoices`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(Array.isArray(data)).toBe(true)
        expect(data.length).toBeGreaterThan(0)

        const invoice = data[0]
        expect(invoice).toHaveProperty('id')
        expect(invoice).toHaveProperty('invoiceNumber')
        expect(invoice).toHaveProperty('date')
        expect(invoice).toHaveProperty('createdAt')
        expect(invoice).toHaveProperty('updatedAt')
        expect(invoice).toHaveProperty('ContractId')
        expect(invoice).toHaveProperty('OrganizationId', orgId)
        expect(invoice).toHaveProperty('JobId')
        expect(invoice).toHaveProperty('BillToClientId')
        expect(invoice).toHaveProperty('UpdatedByUserId')

        expect(invoice).not.toHaveProperty('InvoiceEntries')
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .get(`/organizations/${invalidOrgId}/invoices?expand=true`)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Invalid organization_id')
    })

    it('should return 400 if an exception occurs', async () => {
        jest.spyOn(sequelize, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/invoices?expand=true`)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
