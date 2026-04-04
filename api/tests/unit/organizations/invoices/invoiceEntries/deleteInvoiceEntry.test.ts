const request = require('supertest')
const app = require('../../../../../server')
import { db } from '../../../../../db/index'
import { invoiceEntries, organizations, invoices } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, invoiceId, strangerInvoiceId, invoiceEntryId

beforeAll(async () => {
    const orgResuts = await db.select().from(organizations)
    orgId = orgResuts[0].id

    const invoice = await db.insert(invoices).values(
        {
            OrganizationId: orgId,
            ...fake.mockInvoiceData().returning().then(r => r[0]),
            InvoiceEntries: [fake.mockInvoiceEntryData()],
        },
        {
            include: {
                model: InvoiceEntry,
            },
        }
    )
    invoiceId = invoice.id
    const strangerInvoice = await db.insert(invoices).values(
        {
            OrganizationId: orgResuts[1].id,
            ...fake.mockInvoiceData().returning().then(r => r[0]),
            InvoiceEntries: [fake.mockInvoiceEntryData()],
        },
        {
            include: {
                model: InvoiceEntry,
            },
        }
    )
    strangerInvoiceId = strangerInvoice.id

    const invoiceEntryToDelete = await db.insert(invoiceEntries).values({
        ...fake.mockInvoiceEntryData().returning().then(r => r[0]),
        InvoiceId: invoiceId,
    })
    invoiceEntryId = invoiceEntryToDelete.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Delete invoice entry', () => {
    it('should delete an existing invoice entry', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${invoiceEntryId}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invalidInvoiceId}/entries/${invoiceEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice entry ID is invalid', async () => {
        const invalidInvoiceEntryId = 'invalid-invoice-entry-id'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${invalidInvoiceEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice entry is not found', async () => {
        const nonExistingInvoiceEntryId = '00000000-0000-0000-0000-000000000000'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${nonExistingInvoiceEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice entry does not belong to the organization', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${strangerInvoiceId}/entries/${invoiceEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        // Mock an exception by throwing an error inside the transaction
        jest.spyOn(InvoiceEntry, 'destroy').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${invoiceEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
