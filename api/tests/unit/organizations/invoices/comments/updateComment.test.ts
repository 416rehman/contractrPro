const request = require('supertest')
const app = require('../../../../../server')
import { db } from '../../../../../db/index'
import { comments, organizations, clients, invoices, attachments } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'
const fs = require('fs')

let orgId, invoiceId, strangerOrganizationId, strangerInvoiceId, clientId
let fileToAttachPath, fileContent, fileToAttachName
beforeAll(async () => {
    const org = await db.select().from(organizations)
    orgId = org[0].id
    strangerOrganizationId = org[1].id

    const client = await db.insert(clients).values({
        ...fake.mockClientData().returning().then(r => r[0]),
        OrganizationId: orgId,
    })
    clientId = client.id

    const invoice = await db.insert(invoices).values({
        ...fake.mockInvoiceData().returning().then(r => r[0]),
        OrganizationId: orgId,
        ClientId: clientId,
    })
    invoiceId = invoice.id

    const strangerInvoice = await db.insert(invoices).values({
        ...fake.mockInvoiceData().returning().then(r => r[0]),
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
    await clearDatabase()
})

describe('Update comment for invoice', () => {
    it('should update a comment for a invoice', async () => {
        const commentData = fake.mockCommentData()
        const comment = await db.insert(comments).values({
            ...commentData,
            InvoiceId: invoiceId,
            OrganizationId: orgId,
        }).returning().then(r => r[0])

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
        const comment = await db.insert(comments).values({
            ...commentData,
            InvoiceId: strangerInvoiceId,
            OrganizationId: strangerOrganizationId,
        }).returning().then(r => r[0])

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
        const comment = await db.insert(comments).values({
            content: 'Original content',
            InvoiceId: invoiceId,
            OrganizationId: orgId,
        }).returning().then(r => r[0])

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
