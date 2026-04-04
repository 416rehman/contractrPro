const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { organizations, invoices, invoiceEntries } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, invoiceId
beforeAll(async () => {
    const organization = await db.select().from(organizations).limit(1)
    orgId = organization[0].id

    const [invoice] = await db.insert(invoices).values({
        organizationId: orgId,
        ...fake.mockInvoiceData()
    }).returning()

    await db.insert(invoiceEntries).values({
        ...fake.mockInvoiceEntryData(),
        invoiceId: invoice.id,
        organizationId: orgId
    })

    invoiceId = invoice.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
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
        jest.spyOn(db, 'select').mockImplementationOnce((() => {
            throw new Error('Something went wrong')
        }) as any)

        const response = await request(app)
            .get(`/organizations/${orgId}/invoices/${invoiceId}/entries`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
