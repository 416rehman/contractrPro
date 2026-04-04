const request = require('supertest')
const app = require('../../../../../server')
import { db } from '../../../../../db/index'
import { organizations, invoices, invoiceEntries } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, invoiceId, entry, strangerEntry
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
    entry = invoice.InvoiceEntries[0]

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
    strangerEntry = strangerInvoice.InvoiceEntries[0]
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Get invoice entry', () => {
    it('should return the invoice entry', async () => {
        const entryId = entry.id

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${entryId}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.id).toBe(entryId)
        expect(data.name).toBe(entry.name)
        expect(data.description).toBe(entry.description)
        expect(data.quantity).toBe(entry.quantity)
        expect(data.unitCost).toBe(entry.unitCost)
        expect(data.InvoiceId).toBe(invoiceId)
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'
        const entryId = entry.id

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invalidInvoiceId}/entries/${entryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice entry ID is invalid', async () => {
        const invalidEntryId = 'invalid-entry-id'

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${invalidEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if invoice entry does not belong to invoice', async () => {
        const entryId = strangerEntry.id

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${entryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const entryId = entry.id

        jest.spyOn(InvoiceEntry, 'findOne').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(
                `/organizations/${orgId}/invoices/${invoiceId}/entries/${entryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
