const request = require('supertest')
const app = require('../../../../../server')
import { db } from '../../../../../db/index'
import { organizations, invoices, invoiceEntries } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, invoiceId, strangerInvoiceId
beforeAll(async () => {
    const orgResuts = await db.select().from(organizations)
    orgId = orgResuts[0].id

    const invoice = await db.insert(invoices).values(
        {
            ...fake.mockInvoiceData().returning().then(r => r[0]),
            OrganizationId: orgId,
            InvoiceEntries: [fake.mockInvoiceEntryData()],
        },
        {
            include: [InvoiceEntry],
        }
    )
    invoiceId = invoice.id
    const strangerInvoice = await db.insert(invoices).values(
        {
            ...fake.mockInvoiceData().returning().then(r => r[0]),
            OrganizationId: orgResuts[1].id,
            InvoiceEntries: [fake.mockInvoiceEntryData()],
        },
        {
            include: [InvoiceEntry],
        }
    )

    strangerInvoiceId = strangerInvoice.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Create invoice entry', () => {
    it('should create a new invoice entry', async () => {
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .post(`/organizations/${orgId}/invoices/${invoiceId}/entries`)
            .send(requestBody)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.id).toBeDefined()
        expect(data.name).toBe(requestBody.name)
        expect(data.description).toBe(requestBody.description)
        expect(data.unitCost).toBe(requestBody.unitCost)
        expect(data.quantity).toBe(requestBody.quantity)
        expect(data.InvoiceId).toBe(invoiceId)
        expect(data.updatedAt).toBeDefined()
        expect(data.createdAt).toBeDefined()

        // Cleanup
        if (response?.body?.data?.id) {
            await db.delete(invoiceEntries).where(eq(invoiceEntries.id, response.body.data.id ))
        }
    })

    it('should return 400 if invoice ID is invalid', async () => {
        const invalidInvoiceId = 'invalid-invoice-id'
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .post(
                `/organizations/${orgId}/invoices/${invalidInvoiceId}/entries`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if trying to create an entry for an invoice that does not belong to the organization', async () => {
        const requestBody = fake.mockInvoiceEntryData()

        const response = await request(app)
            .post(
                `/organizations/${orgId}/invoices/${strangerInvoiceId}/entries`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const requestBody = fake.mockInvoiceEntryData()

        jest.spyOn(InvoiceEntry, 'create').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .post(`/organizations/${orgId}/invoices/${invoiceId}/entries`)
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
