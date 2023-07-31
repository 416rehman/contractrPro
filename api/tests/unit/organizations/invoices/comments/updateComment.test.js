const request = require('supertest')
const app = require('../../../../../server')
const {
    Comment,
    Organization,
    Client,
    Invoice,
    Attachment,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../utils/fake')
const fs = require('fs')

let orgId, invoiceId, strangerOrganizationId, strangerInvoiceId, clientId
let fileToAttachPath, fileContent, fileToAttachName
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
    fileToAttachPath = fs.realpathSync(`./${fileToAttachName}`)
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Update comment for invoice', () => {
    it('should update a comment for a invoice', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            InvoiceId: invoiceId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .put(
                `/organizations/${orgId}/invoices/${invoiceId}/comments/${comment.id}`
            )
            .send({ content: 'new content' })
            .expect(200)

        const { status } = response.body

        expect(status).toBe('success')

        // get the updated comment
        const updatedComment = await Comment.findByPk(comment.id)
        expect(updatedComment.content).toBe('new content')
    })

    it('should not update a comment for a invoice that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            InvoiceId: strangerInvoiceId,
            OrganizationId: strangerOrganizationId,
        })

        const response = await request(app)
            .put(
                `/organizations/${orgId}/invoices/${strangerInvoiceId}/comments/${comment.id}`
            )
            .send({ content: 'new content' })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should update a comment for a invoice with attachments', async () => {
        const comment = await Comment.create({
            content: 'Original content',
            InvoiceId: invoiceId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .put(
                `/organizations/${orgId}/invoices/${invoiceId}/comments/${comment.id}`
            )
            .field('content', 'new content')
            .attach('Attachments', fileToAttachPath) // Pass a single file path
            .expect(200)

        const { status } = response.body
        expect(status).toBe('success')

        // // delay to wait for the file to be uploaded to s3
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Get the updated comment
        const updatedComment = await Comment.findByPk(comment.id, {
            include: [
                {
                    model: Attachment,
                },
            ],
        })
        expect(updatedComment.content).toBe('new content')
        expect(updatedComment.Attachments.length).toBe(1)
    })
})