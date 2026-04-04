const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { comments, organizations, clients, invoices } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, invoiceId, comment, clientId
beforeAll(async () => {
    const org = await db.select().from(organizations).limit(1)
    orgId = org[0].id

    const [client] = await db.insert(clients).values({ ...fake.mockClientData(), organizationId: orgId, }).returning()
    clientId = client.id

    const [invoice] = await db.insert(invoices).values({ ...fake.mockInvoiceData(), organizationId: orgId,
        clientId: clientId, }).returning()
    invoiceId = invoice.id

    comment = await db.insert(comments).values({
        ...fake.mockCommentData().returning().then(r => r[0]),
        organizationId: orgId,
        invoiceId: invoiceId,
        authorId: process.env.DEV_USER_UUID,
    })
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
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

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .get(
                `/organizations/${invalidOrgId}/invoices/${invoiceId}/comments`
            )
            .expect(403)

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
        jest.spyOn(db, 'select').mockImplementation(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${invoiceId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
