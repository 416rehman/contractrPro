const request = require('supertest')
const app = require('../../../../../server')
const {
    Organization,
    Invoice,
    InvoiceEntry,
    sequelize,
} = require('../../../../../db')
const { Op } = require('sequelize')

let orgId, invoiceId, entry, strangerEntry
beforeAll(async () => {
    const organization = await Organization.findAll({ limit: 1 })
    orgId = organization[0].id

    const invoice = await Invoice.findAll({
        where: { OrganizationId: orgId },
        limit: 1,
    })
    invoiceId = invoice[0].id

    entry = (
        await InvoiceEntry.findAll({
            where: { InvoiceId: invoiceId },
        })
    )[0]

    strangerEntry = (
        await InvoiceEntry.findAll({
            where: {
                InvoiceId: {
                    [Op.ne]: invoiceId,
                },
            },
        })
    )[0]
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Get invoice entry', () => {
    it('should return the invoice entry', async () => {
        const entryId = entry.id

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${entryId}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.id).toBe(entryId)
        expect(data.name).toBe(entry.name)
        expect(data.description).toBe(entry.description)
        expect(data.quantity).toBe(entry.quantity)
        expect(data.unitCost).toBe(entry.unitCost)
        expect(data.InvoiceId).toBe(invoiceId)
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'
        const entryId = entry.id

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invalidInvoiceId}/entries/${entryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Invoice ID is required')
    })

    it('should return 400 if invoice entry ID is invalid', async () => {
        const invalidEntryId = 'invalid-entry-id'

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${invalidEntryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('InvoiceEntry ID is required')
    })

    it('should return 400 if invoice entry does not belong to invoice', async () => {
        const entryId = strangerEntry.id

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${entryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const entryId = entry.id

        jest.spyOn(InvoiceEntry, 'findOne').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${entryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
