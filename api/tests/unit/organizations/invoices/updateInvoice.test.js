const request = require('supertest')
const app = require('../../../../server')
const { Invoice, Organization, sequelize } = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgId, orgInvoice

beforeAll(async () => {
    const orgResults = await Organization.findAll()
    orgId = orgResults[0].id
    orgInvoice = await Invoice.create({
        ...fake.mockInvoiceData(),
        OrganizationId: orgId,
        InvoiceEntries: [fake.mockInvoiceEntryData()],
    })
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Update invoice', () => {
    it('should update the invoice and return the updated invoice with InvoiceEntries', async () => {
        const invoiceId = orgInvoice.id

        const requestBody = fake.mockInvoiceData()
        requestBody.InvoiceEntries = []
        requestBody.InvoiceEntries.push(fake.mockInvoiceEntryData())

        const response = await request(app)
            .put(`/organizations/${orgId}/invoices/${invoiceId}`)
            .send(requestBody)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toHaveProperty('id', invoiceId)
        expect(data).toHaveProperty('invoiceNumber', requestBody.invoiceNumber)
        expect(data).toHaveProperty('OrganizationId', orgId)
        expect(data).toHaveProperty('UpdatedByUserId')

        expect(data.InvoiceEntries).not.toBe(orgInvoice.InvoiceEntries)
    })

    it('should update the invoice and return the updated invoice without InvoiceEntries', async () => {
        const invoiceId = orgInvoice.id

        const requestBody = fake.mockInvoiceData()

        const response = await request(app)
            .put(`/organizations/${orgId}/invoices/${invoiceId}`)
            .send(requestBody)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toHaveProperty('id', invoiceId)
        expect(data).toHaveProperty('invoiceNumber', requestBody.invoiceNumber)
        expect(data).toHaveProperty('OrganizationId', orgId)
        expect(data).toHaveProperty('UpdatedByUserId')

        expect(data.InvoiceEntries).toBe(orgInvoice.InvoiceEntries)
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const invoiceId = orgInvoice.id

        const response = await request(app)
            .put(`/organizations/${invalidOrgId}/invoices/${invoiceId}`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'

        const response = await request(app)
            .put(`/organizations/${orgId}/invoices/${invalidInvoiceId}`)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Invalid invoice_id')
    })

    it('should return 400 if invoice is not found', async () => {
        const invoiceId = 'non-existing-invoice-id'

        const requestBody = fake.mockInvoiceData()

        const response = await request(app)
            .put(`/organizations/${orgId}/invoices/${invoiceId}`)
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const invoiceId = orgInvoice.id
        const requestBody = fake.mockInvoiceData()

        jest.spyOn(Invoice.prototype, 'update').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .put(`/organizations/${orgId}/invoices/${invoiceId}`)
            .send(requestBody)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
