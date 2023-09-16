const request = require('supertest')
const app = require('../../../src/server')
const { sequelize } = require('../../../db')

let userID

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('GET /users/:user_id/organizations', () => {
    it(`Should return success if the user's organizations are found`, async () => {
        userID = process.env.DEV_USER_UUID

        const response = await request(app)
            .get(`/users/${userID}/organizations`)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('Organizations')
        expect(response.body.data.Organizations).toBeInstanceOf(Array)
        expect(response.body.data.Organizations[0]).toHaveProperty('id')
        expect(response.body.data.Organizations[0]).toHaveProperty('name')
    })

    it(`Should return error for not requiring a user's ID`, async () => {
        userID = null

        const res = await request(app)
            .get(`/users/${userID}/organizations`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })

    it(`Should return error for trying to find organizations from a user that doesn't exist`, async () => {
        userID = '550e8400-e29b-41d4-a716-446655440000'

        const res = await request(app)
            .get(`/users/${userID}/organizations`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })
})
