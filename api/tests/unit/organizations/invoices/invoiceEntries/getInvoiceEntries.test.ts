const request = require('supertest')
const app = require('../../../../../server')
const {
    Organization,
    Invoice,
    InvoiceEntry,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../utils/fake')

let orgId, invoiceId
beforeAll(async () => {
    const organization = await Organization.findAll({ limit: 1 })
    orgId = organization[0].id

    const invoice = await Invoice.create(
        {
            OrganizationId: orgId,
            ...fake.mockInvoiceData(),
            InvoiceEntries: [fake.mockInvoiceEntryData()],
        },
        {
            include: {
                model: InvoiceEntry,
            },
        }
    )

    invoiceId = invoice.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Get invoice entries', () => {
    it('should return the invoice entries', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${invoiceId}/entries`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(Array.isArray(data)).toBe(true)

        expect(data[0].id).toBeDefined()
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${invalidInvoiceId}/entries`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        jest.spyOn(InvoiceEntry, 'findAll').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${invoiceId}/entries`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
