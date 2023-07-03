const request = require('supertest')
const app = require('../../../../server')
const { Organization, Invoice, sequelize } = require('../../../../db')
const { Op } = require('sequelize')

let orgId, invoice, strangerInvoice

beforeAll(async () => {
    const orgResuts = await Organization.findAll()
    orgId = orgResuts[0].id
    invoice = await Invoice.findOne({ where: { OrganizationId: orgId } })
    strangerInvoice = await Invoice.findOne({
        where: {
            OrganizationId: {
                [Op.not]: orgId,
            },
        },
    })
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Get all organization invoices', () => {
    it('should return the invoice with its InvoiceEntries', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${invoice.id}`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')

        const body = data
        expect(body).toHaveProperty('id')
        expect(body).toHaveProperty('invoiceNumber')
        expect(body).toHaveProperty('date')
        expect(body).toHaveProperty('createdAt')
        expect(body).toHaveProperty('updatedAt')
        expect(body).toHaveProperty('ContractId')
        expect(body).toHaveProperty('OrganizationId', orgId)
        expect(body).toHaveProperty('JobId')
        expect(body).toHaveProperty('BillToClientId')
        expect(body).toHaveProperty('UpdatedByUserId')

        expect(Array.isArray(body.InvoiceEntries)).toBe(true)
        expect(body.InvoiceEntries.length).toBeGreaterThan(0)

        const invoiceEntry = body.InvoiceEntries[0]
        expect(invoiceEntry).toHaveProperty('id')
        expect(invoiceEntry).toHaveProperty('name')
        expect(invoiceEntry).toHaveProperty('quantity')
        expect(invoiceEntry).toHaveProperty('unitCost')
        expect(invoiceEntry).toHaveProperty('createdAt')
        expect(invoiceEntry).toHaveProperty('updatedAt')
        expect(invoiceEntry).toHaveProperty('InvoiceId', body.id)
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

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${invalidInvoiceId}`)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Invalid invoice_id')
    })

    it('should return 400 if the invoice does not belong to the organization', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${strangerInvoice.id}`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
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
