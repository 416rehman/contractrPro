const request = require('supertest')
const app = require('../../../../server')
const { Organization, Vendor, sequelize } = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgId
beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgId = orgs[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Add vendor to organization', () => {
    it('It should add a vendor to an organization', async () => {
        const vendorData = fake.mockVendorData()

        const response = await request(app)
            .post(`/organizations/${orgId}/vendors`)
            .send(vendorData)
            .expect(201)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('name', vendorData.name)
        expect(response.body.data).toHaveProperty('phone', vendorData.email)
        expect(response.body.data).toHaveProperty('email', vendorData.phone)
        expect(response.body.data).toHaveProperty('website', vendorData.website)
        expect(response.body.data).toHaveProperty(
            'description',
            vendorData.description
        )
        expect(response.body.data).toHaveProperty('OrganizationId', orgId)
        expect(response.body.data).toHaveProperty('UpdatedByUserId')
        expect(response.body.data).toHaveProperty('updatedAt')
        expect(response.body.data).toHaveProperty('createdAt')

        // cleanup - delete the vendor
        if (response?.body?.data?.id) {
            await Vendor.destroy({
                where: { id: response.body.data.id },
            })
        }
    })

    it('should return 400 if a vendor with same email or phone already exists', async () => {
        const vendorData = fake.mockVendorData()

        // Create first vendor
        const initVendor = await Vendor.create({
            ...vendorData,
            OrganizationId: orgId,
        })

        // Create second vendor with same email and phone
        const response = await request(app)
            .post(`/organizations/${orgId}/vendors`)
            .send(vendorData)
            .expect(400)

        expect(response.body.status).toBe('error')
        expect(response.body.message).toBeDefined()

        // cleanup - delete the vendor
        if (initVendor?.id) {
            await Vendor.destroy({
                where: { id: initVendor.id },
            })
        }
    })

    it('should return 400 if an error occurs during saving', async () => {
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
