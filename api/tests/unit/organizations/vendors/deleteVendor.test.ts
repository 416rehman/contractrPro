const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { organizations, vendors } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgId, vendorId, strangerVendorId

beforeAll(async () => {
    const orgResuts = await db.select().from(organizations)
    orgId = orgResuts[0].id

    const [vendorToDelete] = await db.insert(vendors).values({ ...fake.mockVendorData(), organizationId: orgId, }).returning()
    vendorId = vendorToDelete.id

    const [strangerVendor] = await db.insert(vendors).values({ ...fake.mockVendorData(), organizationId: orgResuts[1].id, }).returning()
    strangerVendorId = strangerVendor.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Delete organization vendor', () => {
    it('Should delete an organization vendor', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/vendors/${vendorId}`)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toBe(1)
    })

    it('Should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .delete(`/organizations/${invalidOrgId}/vendors/${vendorId}`)
            .expect(403)

        expect(response.body.status).toBe('error')
    })

    it('Should return 400 if vendor ID is invalid', async () => {
        const invalidVendorId = 'invalid-vendor-id'

        const response = await request(app)
            .delete(`/organizations/${orgId}/vendors/${invalidVendorId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('Should return 400 if vendor is not found', async () => {
        jest.spyOn(Vendor, 'destroy').mockImplementationOnce(() => 0)

        const response = await request(app)
            .delete(`/organizations/${orgId}/vendors/${vendorId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('Should return 400 if the vendor is not in the organization', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/vendors/${strangerVendorId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('Should return 400 if an exception occurs', async () => {
        jest.spyOn(db, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .delete(`/organizations/${orgId}/vendors/${vendorId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
