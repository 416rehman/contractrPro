const request = require('supertest')
const app = require('../../../../server')
const { Organization, Vendor, sequelize } = require('../../../../db')

let orgId
beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgId = orgs[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Get organization vendors', () => {
    it('should return organization vendors', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/vendors`)
            .expect(200)

        expect(response.body.status).toBe('success')

        const vendor = response.body.data[0]
        expect(vendor).toHaveProperty('id')
        expect(vendor).toHaveProperty('name')
        expect(vendor).toHaveProperty('phone')
        expect(vendor).toHaveProperty('email')
        expect(vendor).toHaveProperty('website')
        expect(vendor).toHaveProperty('description')
        expect(vendor).toHaveProperty('createdAt')
        expect(vendor).toHaveProperty('updatedAt')
        expect(vendor).toHaveProperty('UpdatedByUserId')
        expect(vendor).toHaveProperty('OrganizationId')
    })

    it('should return an error if an exception occurs', async () => {
        jest.spyOn(Vendor, 'findAll').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/vendors`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
