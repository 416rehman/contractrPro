const request = require('supertest')
const app = require('../../../../server')
const { Organization, Invoice, sequelize } = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgId

beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgId = orgs[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Create invoice', () => {
    it('should create an invoice with entries', async () => {
        const invoiceData = fake.mockInvoiceData()
        invoiceData.InvoiceEntries = []
        invoiceData.InvoiceEntries.push(fake.mockInvoiceEntryData())

        const response = await request(app)
            .post(`/organizations/${orgId}/invoices`)
            .send(invoiceData)
            .expect(201)

        const { status, data } = response.body
        const { id, invoiceNumber, InvoiceEntries } = data

        expect(status).toBe('success')
        expect(id).toBeTruthy()
        expect(invoiceNumber).toBe(invoiceData.invoiceNumber)
        expect(InvoiceEntries).toBeInstanceOf(Array)
        expect(InvoiceEntries.length).toBeGreaterThan(0)
        expect(InvoiceEntries[0]).toHaveProperty('id')
        expect(InvoiceEntries[0]).toHaveProperty(
            'name',
            invoiceData.InvoiceEntries[0].name
        )
        expect(InvoiceEntries[0]).toHaveProperty(
            'description',
            invoiceData.InvoiceEntries[0].description
        )
        expect(InvoiceEntries[0]).toHaveProperty(
            'quantity',
            invoiceData.InvoiceEntries[0].quantity
        )
        expect(InvoiceEntries[0]).toHaveProperty(
            'unitCost',
            invoiceData.InvoiceEntries[0].unitCost
        )
        expect(InvoiceEntries[0]).toHaveProperty('InvoiceId', id)

        // Cleanup
        if (response?.body?.data?.id) {
            await Invoice.destroy({
                where: { id: response.body.data.id },
            })
        }
    })

    it('should create an invoice without entries', async () => {
        const invoiceData = fake.mockInvoiceData()
        invoiceData.InvoiceEntries = []

        const response = await request(app)
            .post(`/organizations/${orgId}/invoices`)
            .send(invoiceData)
            .expect(201)

        const { status, data } = response.body
        const { id, invoiceNumber, InvoiceEntries } = data

        expect(status).toBe('success')
        expect(id).toBeTruthy()
        expect(invoiceNumber).toBe(invoiceData.invoiceNumber)
        expect(InvoiceEntries).toBeInstanceOf(Array)
        expect(InvoiceEntries.length).toBe(0)
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const invoiceData = fake.mockInvoiceData()

        const response = await request(app)
            .post(`/organizations/${invalidOrgId}/invoices`)
            .send(invoiceData)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Invalid organization_id')
    })

    it('should return 400 if an exception occurs', async () => {
        const invoiceData = fake.mockInvoiceData()

        jest.spyOn(sequelize, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .post(`/organizations/${orgId}/invoices`)
            .send(invoiceData)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
