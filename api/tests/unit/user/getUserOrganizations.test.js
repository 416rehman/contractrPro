const request = require('supertest')
const app = require('../../../server')

describe('GET /users/:user_id/organizations', () => {
    test(`Should return success if the user's organizations are found`, async () => {
        // Get a valid user ID
        const userID = process.env.DEV_USER_UUID

        // Make the GET request to /users/:user_id/organizations route with a valid user ID
        const res = await request(app)
            .get(`/users/${userID}/organizations`)
            .expect(200)

        // Expect to have a success status with the data, including the id and an array of Organizations with each of them consisting of id and name
        expect(res.body).toHaveProperty('status', 'success')
        expect(res.body).toHaveProperty('data')
        expect(res.body.data).toHaveProperty('id')
        expect(res.body.data).toHaveProperty('Organizations')
        expect(res.body.data.Organizations).toBeInstanceOf(Array)
        expect(res.body.data.Organizations[0]).toHaveProperty('id')
        expect(res.body.data.Organizations[0]).toHaveProperty('name')
    })

    test(`Should return error for not requiring a user's ID`, async () => {
        // Get an empty user ID
        const userID = null

        // Make the GET request to /users/:user_id/organizations route with an empty user ID
        const res = await request(app)
            .get(`/users/${userID}/organizations`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        // Expect to have an error status with the error message and data
        expect(res.body).toHaveProperty('status', 'error')
        expect(res.body).toHaveProperty('error', 'User ID required')
    })

    test(`Should return with a 400 status code for not finding a user's organizations with an invalid ID`, async () => {
        // Get an invalid user ID
        const userID = '550e8400-e29b-41d4-a716-446655440000'

        // Make the GET request to /users/:user_id/organizations with an invalid user ID
        const res = await request(app)
            .get(`/users/${userID}/organizations`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        // Expect to have an error status with the error message
        expect(res.body).toHaveProperty('status', 'error')
        expect(res.body).toHaveProperty('error', 'User not found')
    })
})
