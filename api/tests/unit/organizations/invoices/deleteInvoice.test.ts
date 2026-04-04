const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { invoices, organizations } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgId, invoiceId

beforeAll(async () => {
    const orgResults = await db.select().from(organizations)
    orgId = orgResults[0].id
    const [invoiceToDelete] = await db.insert(invoices).values({ ...fake.mockInvoiceData(), organizationId: orgId, }).returning()
    invoiceId = invoiceToDelete.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
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

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const response = await request(app)
            .delete(`/organizations/${invalidOrgId}/invoices/${invoiceId}`)
            .expect(403)

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

        const { status } = response.body

        expect(status).toBe('error')
    })
})
