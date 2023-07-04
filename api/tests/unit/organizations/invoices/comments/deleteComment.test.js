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
const fs = require('fs')

let orgId, invoiceId, strangerOrganizationId, strangerInvoiceId, clientId
let fileContent, fileToAttachName
beforeAll(async () => {
    const org = await Organization.findAll()
    orgId = org[0].id
    strangerOrganizationId = org[1].id

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

    const strangerInvoice = await Invoice.create({
        ...fake.mockInvoiceData(),
        OrganizationId: strangerOrganizationId,
        ClientId: clientId,
    })
    strangerInvoiceId = strangerInvoice.id

    // create a file and get its absolute path
    fileContent = 'test'
    fileToAttachName = 'test.txt'
    fs.writeFileSync(`./${fileToAttachName}`, fileContent)
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Delete comment for invoice', () => {
    it('should delete a comment for a invoice', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            InvoiceId: invoiceId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invoiceId}/comments/${comment.id}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should not delete a comment for a invoice that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            InvoiceId: strangerInvoiceId,
            OrganizationId: strangerOrganizationId,
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${strangerInvoiceId}/comments/${comment.id}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should not delete a comment for a invoice that does not exist', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invoiceId}/comments/999999`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
