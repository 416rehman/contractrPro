const request = require('supertest')
const app = require('../../../../../server')
const {
    Comment,
    Organization,
    Client,
    Invoice,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../utils/fake')

let orgId, invoiceId, comment, clientId
beforeAll(async () => {
    const org = await Organization.findAll({ limit: 1 })
    orgId = org[0].id

    const client = await Client.create({
        ...fake.mockClientData(),
        OrganizationId: orgId,
    })
    clientId = client.id

    const invoice = await Invoice.create({
        ...fake.mockInvoiceData(),
        OrganizationId: orgId,
        ClientId: clientId,
    })
    invoiceId = invoice.id

    comment = await Comment.create({
        ...fake.mockCommentData(),
        OrganizationId: orgId,
        InvoiceId: invoiceId,
        AuthorId: process.env.DEV_USER_UUID,
    })
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Get comments for invoice', () => {
    it('should get comments for a invoice', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${invoiceId}/comments`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.comments).toBeDefined()
        expect(Array.isArray(data.comments)).toBe(true)
        expect(data.comments.length).toBeGreaterThan(0)

        // expect comment to be in the response
        const commentInResponse = data.comments.find((c) => c.id === comment.id)
        expect(commentInResponse).toBeDefined()
        expect(commentInResponse.content).toBe(comment.content)
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .get(
                `/organizations/${invalidOrgId}/invoices/${invoiceId}/comments`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invalidInvoiceId}/comments`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice does not belong to organization', async () => {
        const invoiceId = 'non-existing-invoice-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${invoiceId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an error occurs during the transaction', async () => {
        // Mock the transaction to throw an error
        jest.spyOn(Comment, 'findAndCountAll').mockImplementation(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${invoiceId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
