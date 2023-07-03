const request = require('supertest')
const app = require('../../../../../server')
const {
    InvoiceEntry,
    Organization,
    Invoice,
    sequelize,
} = require('../../../../../db')
const { Op } = require('sequelize')
const fake = require('../../../../../utils/fake')

let orgId, invoiceId, strangerInvoiceId, invoiceEntryId

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

    const invoiceEntryToDelete = await InvoiceEntry.create({
        ...fake.mockInvoiceEntryData(),
        InvoiceId: invoiceId,
    })
    invoiceEntryId = invoiceEntryToDelete.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Delete invoice entry', () => {
    it('should delete an existing invoice entry', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${invoiceEntryId}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invalidInvoiceId}/entries/${invoiceEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice entry ID is invalid', async () => {
        const invalidInvoiceEntryId = 'invalid-invoice-entry-id'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${invalidInvoiceEntryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('InvoiceEntry ID is required')
    })

    it('should return 400 if invoice entry is not found', async () => {
        const nonExistingInvoiceEntryId = '00000000-0000-0000-0000-000000000000'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${nonExistingInvoiceEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice entry does not belong to the organization', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${strangerInvoiceId}/entries/${invoiceEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        // Mock an exception by throwing an error inside the transaction
        jest.spyOn(InvoiceEntry, 'destroy').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${invoiceEntryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
