const request = require('supertest')
const app = require('../../../server')
const { sequelize } = require('../../../db')
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('GET /admin/users', () => {
    test('should get all users', async () => {
        const res = await request(app).get('/admin/users').expect(200)

        expect(res.body).toHaveProperty('status', 'success')
        expect(res.body).toHaveProperty('data')

        expect(res.body.data).toHaveProperty('users')
        expect(res.body.data.users).toBeInstanceOf(Array)
        expect(res.body.data.users[0]).toHaveProperty('id')
        expect(res.body.data.users[0]).toHaveProperty('email')
        expect(res.body.data.users[0]).toHaveProperty('username')

        expect(res.body.data).toHaveProperty('currentPage')
        expect(res.body.data).toHaveProperty('totalPages')
    })
})
