const request = require('supertest')
const app = require('../../../../server')
const { Invoice, Organization, sequelize } = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgId, invoiceId

beforeAll(async () => {
    const orgResults = await Organization.findAll()
    orgId = orgResults[0].id
    const invoiceToDelete = await Invoice.create({
        ...fake.mockInvoiceData(),
        OrganizationId: orgId,
    })
    invoiceId = invoiceToDelete.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Delete invoice', () => {
    it('should delete the invoice and return the number of rows deleted', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/invoices/${invoiceId}`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const response = await request(app)
            .delete(`/organizations/${invalidOrgId}/invoices/${invoiceId}`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'
        const response = await request(app)
            .delete(`/organizations/${orgId}/invoices/${invalidInvoiceId}`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice is not found', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/invoices/999999`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        jest.spyOn(Invoice, 'destroy').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .delete(`/organizations/${orgId}/invoices/${invoiceId}`)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
