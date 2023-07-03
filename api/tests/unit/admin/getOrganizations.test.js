const request = require('supertest')
const app = require('../../../server')
const { Organization, sequelize } = require('../../../db')

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('GET /admin/organizations', () => {
    test('Should return success and organizations data', async () => {
        const res = await request(app).get('/admin/organizations').expect(200)

        expect(res.body).toHaveProperty('status', 'success')
        expect(res.body).toHaveProperty('data')

        const organizations = res.body.data.organizations
        expect(Array.isArray(organizations)).toBe(true)

        organizations.forEach((org) => {
            expect(org).toHaveProperty('id')
            expect(org).toHaveProperty('name')
            expect(org).toHaveProperty('description')
            expect(org).toHaveProperty('email')
            expect(org).toHaveProperty('phone')
            expect(org).toHaveProperty('website')
            expect(org).toHaveProperty('logoUrl')
            expect(org).toHaveProperty('createdAt')
            expect(org).toHaveProperty('updatedAt')
            expect(org).toHaveProperty('OwnerId')
            expect(org).toHaveProperty('UpdatedByUserId')
        })

        expect(res.body.data).toHaveProperty('currentPage')
        expect(res.body.data).toHaveProperty('totalPages')
    })

    test('Should handle server errors and return an error response', async () => {
        // Mocking the implementation to simulate a server error
        jest.spyOn(Organization, 'findAndCountAll').mockImplementationOnce(
            () => {
                throw new Error('Something went wrong')
            }
        )

        const res = await request(app).get('/admin/organizations').expect(400)

        expect(res.body).toHaveProperty('status', 'error')
        expect(res.body).toHaveProperty('message', 'Something went wrong')
    })
})
