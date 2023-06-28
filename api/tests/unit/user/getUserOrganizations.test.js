const request = require('supertest')
const app = require('../../../server')

describe('GET /users/:user_id/organizations', () => {
    
    test(`Should return success if the user's organizations are found`, async () => {
              
        const userID = process.env.DEV_USER_UUID;

        // Make the GET request to /users/:user_id/organizations route with a valid user ID
        const res = await request(app).get(`/users/${userID}/organizations`).expect(200)

        // Expect to have a success status with the data array, including an array of Organizations with its data
        expect(res.body).toHaveProperty('status', 'success')
        expect(res.body).toHaveProperty('data')
        expect(res.body.data).toBeInstanceOf(Array)
        expect(res.body.data[0]).toHaveProperty('Organizations')
        expect(res.body.data[0].Organizations).toBeInstanceOf(Array)
        expect(res.body.data[0].Organizations[0]).toHaveProperty('id')
        expect(res.body.data[0].Organizations[0]).toHaveProperty('name')

    })

    test(`Should return with a 400 status code for not requiring a user's ID`, async () => {

        const userID = null;

        // Make the GET request to /users/:user_id/organizations route without a user ID
        const res = await request(app).get(`/users/${userID}/organizations`)
        .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        // Expect to have an error status with the error message and data
        expect(res.body).toHaveProperty('status', 'error')
        expect(res.body).toHaveProperty('error', 'message')
        expect(res.body).toHaveProperty('data')
    })

    test(`Should return with a 400 status code for not finding a user's organizations with an invalid ID`, async () => {

        // Make the GET request to /users/:user_id/organizations with an invalid user ID
        const res = await request(app).get(`/users/550e8400-e29b-41d4-a716-446655440000/organizations`)
        .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        // Expect to have an error status with the error message and data
        expect(res.body).toHaveProperty('status', 'error')
        expect(res.body).toHaveProperty('error', 'message')
        expect(res.body).toHaveProperty('data')

    })

})