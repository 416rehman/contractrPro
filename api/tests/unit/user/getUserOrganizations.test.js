const request = require('supertest')
const app = require('../../../server')

describe('GET /user/:user_id/organizations', () => {
    test('should get all organizations of a user', async () => {
        // get user id from env variable DEV_USER_UUID
        const userId = process.env.DEV_USER_UUID
        const res = await request(app).get(`/users/${userId}/organizations`).expect(200)

        expect(res.body).toHaveProperty('status', 'success')
        expect(res.body).toHaveProperty('data')

        expect(res.body.data).toBeInstanceOf(Array)
        expect(res.body.data[0]).toHaveProperty('Organizations')
        expect(res.body.data[0].Organizations).toBeInstanceOf(Array)
        expect(res.body.data[0].Organizations[0]).toHaveProperty('id')
        expect(res.body.data[0].Organizations[0]).toHaveProperty('name')
    })
})