const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { organizations, vendors } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

const { Op } = require('sequelize')

let orgId, vendor, strangerVendor
beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgId = orgs[0].id

    vendor = (await db.select().from(vendors).limit(1))[0]

    strangerVendor = (await db.select().from(vendors).limit(1))[0]
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Get organization vendor', () => {
    it('Should return an organization vendor', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/vendors/${vendor.id}`)
            .expect(200)

        expect(response.body.status).toBe('success')

        const body = response.body.data
        expect(body).toHaveProperty('id')
        expect(body).toHaveProperty('name')
        expect(body).toHaveProperty('phone')
        expect(body).toHaveProperty('email')
        expect(body).toHaveProperty('website')
        expect(body).toHaveProperty('description')
        expect(body).toHaveProperty('createdAt')
        expect(body).toHaveProperty('updatedAt')
        expect(body).toHaveProperty('UpdatedByUserId')
        expect(body).toHaveProperty('OrganizationId')
    })

    it('Should return an error if a bad vendor ID is provided', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/vendors/123`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('Should return 403 if organization ID is invalid', async () => {
        const response = await request(app)
            .get(`/organizations/123/vendors/${vendor.id}`)
            .expect(403)

        expect(response.body.status).toBe('error')
    })

    it('Should return an error if the vendor does not belong to the organization', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/vendors/${strangerVendor.id}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('Should return an error if an exception occurs', async () => {
        jest.spyOn(Vendor, 'findAll').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/vendors`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
