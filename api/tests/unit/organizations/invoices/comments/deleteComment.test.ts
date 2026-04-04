const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { comments, organizations, clients, invoices } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'
const fs = require('fs')

let orgId, invoiceId, strangerOrganizationId, strangerInvoiceId, clientId
let fileContent, fileToAttachName
beforeAll(async () => {
    const org = await db.select().from(organizations)
    orgId = org[0].id
    const [strangerOrg] = await db.insert(organizations).values(fake.mockOrganizationData()).returning();
    strangerOrganizationId = strangerOrg.id

    const [client] = await db.insert(clients).values({ ...fake.mockClientData(), organizationId: orgId, }).returning()
    clientId = client.id

    const [invoice] = await db.insert(invoices).values({ ...fake.mockInvoiceData(), organizationId: orgId,
        clientId: clientId, }).returning()
    invoiceId = invoice.id

    const [strangerInvoice] = await db.insert(invoices).values({ ...fake.mockInvoiceData(), organizationId: strangerOrganizationId,
        clientId: clientId, }).returning()
    strangerInvoiceId = strangerInvoice.id

    // create a file and get its absolute path
    fileContent = 'test'
    fileToAttachName = 'test.txt'
    fs.writeFileSync(`./${fileToAttachName}`, fileContent)
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})

describe('Delete comment for invoice', () => {
    it('should delete a comment for a invoice', async () => {
        const commentData = fake.mockCommentData()
        const comment = await db.insert(comments).values({
            ...commentData,
            invoiceId: invoiceId,
            organizationId: orgId,
        }).returning().then(r => r[0])

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
        const comment = await db.insert(comments).values({
            ...commentData,
            invoiceId: strangerInvoiceId,
            organizationId: strangerOrganizationId,
        }).returning().then(r => r[0])

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
