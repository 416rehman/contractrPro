const request = require('supertest')
const app = require('../../../../../server')
const {
    Organization,
    Invoice,
    InvoiceEntry,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../utils/fake')
const { Op } = require('sequelize')

let orgId, invoiceId, strangerInvoiceId
beforeAll(async () => {
    const organization = await Organization.findAll({ limit: 1 })
    orgId = organization[0].id

    const invoice = await Invoice.findAll({
        where: { OrganizationId: orgId },
        limit: 1,
    })
    invoiceId = invoice[0].id
    const strangerInvoice = await Invoice.findAll({
        where: {
            OrganizationId: {
                [Op.ne]: orgId,
            },
        },
    })
    strangerInvoiceId = strangerInvoice[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Create invoice entry', () => {
    it('should create a new invoice entry', async () => {
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .post(`/organizations/${orgId}/invoices/${invoiceId}/entries`)
            .send(requestBody)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.id).toBeDefined()
        expect(data.name).toBe(requestBody.name)
        expect(data.description).toBe(requestBody.description)
        expect(data.unitCost).toBe(requestBody.unitCost)
        expect(data.quantity).toBe(requestBody.quantity)
        expect(data.InvoiceId).toBe(invoiceId)
        expect(data.updatedAt).toBeDefined()
        expect(data.createdAt).toBeDefined()

        // Cleanup
        if (response?.body?.data?.id) {
            await InvoiceEntry.destroy({
                where: { id: response.body.data.id },
            })
        }
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .post(
                `/organizations/${orgId}/invoices/${invalidInvoiceId}/entries`
            )
            .send(requestBody)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Invoice ID is required')
    })

    it('should return 400 if trying to create an entry for an invoice that does not belong to the organization', async () => {
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .post(
                `/organizations/${orgId}/invoices/${strangerInvoiceId}/entries`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const requestBody = fake.mockInvoiceEntryData()

        jest.spyOn(InvoiceEntry, 'create').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .post(`/organizations/${orgId}/invoices/${invoiceId}/entries`)
            .send(requestBody)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
