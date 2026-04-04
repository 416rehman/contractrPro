const request = require('supertest')
const app = require('../../../../server')
import { db } from '../../../../db/index'
import { organizations, vendors } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgId, vendor
beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgId = orgs[0].id

    vendor = await Vendor.findOne({
        where: { OrganizationId: orgId },
    })
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Update organization vendor', () => {
    it('Should update an organization vendor', async () => {
        const vendorId = vendor.id
        const updatedVendorData = fake.mockVendorData()

        const response = await request(app)
            .put(`/organizations/${orgId}/vendors/${vendorId}`)
            .send(updatedVendorData)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveProperty('id', vendorId)
        expect(response.body.data).toHaveProperty(
            'name',
            updatedVendorData.name
        )
        expect(response.body.data).toHaveProperty(
            'phone',
            updatedVendorData.phone
        )
        expect(response.body.data).toHaveProperty(
            'email',
            updatedVendorData.email
        )
        expect(response.body.data).toHaveProperty(
            'website',
            updatedVendorData.website
        )
        expect(response.body.data).toHaveProperty(
            'description',
            updatedVendorData.description
        )
        expect(response.body.data).toHaveProperty('createdAt')
        expect(response.body.data).toHaveProperty('updatedAt')
        expect(response.body.data).toHaveProperty('UpdatedByUserId')
        expect(response.body.data).toHaveProperty('OrganizationId', orgId)
    })

    it('Should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const vendorId = vendor.id
        const updatedVendorData = fake.mockVendorData()

        const response = await request(app)
            .put(`/organizations/${invalidOrgId}/vendors/${vendorId}`)
            .send(updatedVendorData)
            .expect(403)

        expect(response.body.status).toBe('error')
    })

    it('Should return 400 if vendor ID is invalid', async () => {
        const invalidVendorId = 'invalid-vendor-id'
        const updatedVendorData = fake.mockVendorData()

        const response = await request(app)
            .put(`/organizations/${orgId}/vendors/${invalidVendorId}`)
            .send(updatedVendorData)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('Should return 400 if an exception occurs', async () => {
        const vendorId = vendor.id
        const updatedVendorData = fake.mockVendorData()

        jest.spyOn(db, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .put(`/organizations/${orgId}/vendors/${vendorId}`)
            .send(updatedVendorData)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
