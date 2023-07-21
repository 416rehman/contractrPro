const request = require('supertest')
const app = require('../../../../server')
const { Organization, Vendor, sequelize } = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgId, vendorId, strangerVendorId

beforeAll(async () => {
    const orgResuts = await Organization.findAll()
    orgId = orgResuts[0].id

    const vendorToDelete = await Vendor.create({
        ...fake.mockVendorData(),
        OrganizationId: orgId,
    })
    vendorId = vendorToDelete.id

    const strangerVendor = await Vendor.create({
        ...fake.mockClientData(),
        OrganizationId: orgResuts[1].id,
    })
    strangerVendorId = strangerVendor.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Delete organization vendor', () => {
    it('should delete an organization vendor', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/vendors/${vendorId}`)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toBe(1)
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .delete(`/organizations/${invalidOrgId}/vendors/${vendorId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if vendor ID is invalid', async () => {
        const invalidVendorId = 'invalid-vendor-id'

        const response = await request(app)
            .delete(`/organizations/${orgId}/vendors/${invalidVendorId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if vendor is not found', async () => {
        jest.spyOn(Vendor, 'destroy').mockImplementationOnce(() => 0)

        const response = await request(app)
            .delete(`/organizations/${orgId}/vendors/${vendorId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if the vendor is not in the organization', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/vendors/${strangerVendorId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        jest.spyOn(sequelize, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .delete(`/organizations/${orgId}/vendors/${vendorId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
