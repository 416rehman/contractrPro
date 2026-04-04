const request = require('supertest')
const app = require('../../../../server')
import { db } from '../../../../db/index'
import { organizations, vendors } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgId
beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgId = orgs[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Add vendor to organization', () => {
    it('Should add a vendor to an organization', async () => {
        const vendorData = fake.mockVendorData()

        const response = await request(app)
            .post(`/organizations/${orgId}/vendors`)
            .send(vendorData)
            .expect(201)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('name', vendorData.name)
        expect(response.body.data).toHaveProperty('phone', vendorData.phone)
        expect(response.body.data).toHaveProperty('email', vendorData.email)
        expect(response.body.data).toHaveProperty('website', vendorData.website)
        expect(response.body.data).toHaveProperty(
            'description',
            vendorData.description
        )
        expect(response.body.data).toHaveProperty('OrganizationId', orgId)
        expect(response.body.data).toHaveProperty('UpdatedByUserId')
        expect(response.body.data).toHaveProperty('updatedAt')
        expect(response.body.data).toHaveProperty('createdAt')

        // Cleanup - delete the vendor
        if (response?.body?.data?.id) {
            await db.delete(vendors).where(eq(vendors.id, response.body.data.id ))
        }
    })

    it('Should return 400 if a vendor with same email or phone already exists', async () => {
        const vendorData = fake.mockVendorData()

        // Create first vendor
        const initVendor = await db.insert(vendors).values({
            ...vendorData,
            OrganizationId: orgId,
        }).returning().then(r => r[0])

        // Create second vendor with same email and phone
        const response = await request(app)
            .post(`/organizations/${orgId}/vendors`)
            .send(vendorData)
            .expect(400)

        expect(response.body.status).toBe('error')
        expect(response.body.message).toBeDefined()

        // Cleanup - delete the vendor
        if (initVendor?.id) {
            await db.delete(vendors).where(eq(vendors.id, initVendor.id ))
        }
    })

    it('Should return 400 if an error occurs during saving', async () => {
        jest.spyOn(Vendor, 'create').mockImplementation(() => {
            throw new Error('Something went wrong')
        })

        const vendorData = fake.mockVendorData()

        const response = await request(app)
            .post(`/organizations/${orgId}/vendors`)
            .send(vendorData)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
