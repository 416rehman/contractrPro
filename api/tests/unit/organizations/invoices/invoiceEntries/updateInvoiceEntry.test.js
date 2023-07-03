const request = require('supertest')
const app = require('../../../../../server')
const {
    Organization,
    InvoiceEntry,
    Invoice,
    sequelize,
} = require('../../../../../db')
const { Op } = require('sequelize')
const fake = require('../../../../../utils/fake')

let orgId, invoiceId, strangerInvoiceId, invoiceEntry
beforeAll(async () => {
    const organization = await Organization.findAll({ limit: 1 })
    orgId = organization[0].id

    const invoice = await Invoice.findAll({
        where: { OrganizationId: orgId },
        limit: 1,
    })
    invoiceId = invoice[0].id

    invoiceEntry = (
        await InvoiceEntry.findAll({
            where: { InvoiceId: invoiceId },
            limit: 1,
        })
    )[0]

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
describe('Update invoice entry', () => {
    it('should update an existing invoice entry', async () => {
        const entryId = invoiceEntry.id
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.id).toBe(entryId)
        expect(data.name).toBe(requestBody.name)
        expect(data.description).toBe(requestBody.description)
        expect(data.unitCost).toBe(requestBody.unitCost)
        expect(data.quantity).toBe(requestBody.quantity)
        expect(data.InvoiceId).toBe(invoiceId)
        expect(data.updatedAt).toBeDefined()
        expect(data.createdAt).toBeDefined()
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const entryId = invoiceEntry.id
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .put(
                `/organizations/${invalidOrgId}/invoices/${invoiceId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'
        const entryId = invoiceEntry.id
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/invoices/${invalidInvoiceId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice entry ID is invalid', async () => {
        const invalidEntryId = 'invalid-entry-id'
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${invalidEntryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice entry is not found', async () => {
        const nonExistingEntryId = 'non-existing-entry-id'
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${nonExistingEntryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice entry does not belong to the organization', async () => {
        const entryId = invoiceEntry.id
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/invoices/${strangerInvoiceId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an error occurs during the update', async () => {
        // Mock the transaction to throw an error
        jest.spyOn(InvoiceEntry, 'update').mockImplementation(() => {
            throw new Error('Something went wrong')
        })

        const entryId = invoiceEntry.id
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
