const request = require('supertest')
const app = require('../../../../server')
const { Organization, Vendor, sequelize } = require('../../../../db')
const { Op } = require('sequelize')

let orgId, vendor, strangerVendor
beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgId = orgs[0].id

    vendor = await Vendor.findOne({
        where: { OrganizationId: orgId },
    })

    strangerVendor = await Vendor.findOne({
        where: { OrganizationId: { [Op.ne]: orgId } },
    })
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
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
