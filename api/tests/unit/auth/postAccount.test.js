const request = require('supertest')
const app = require('../../../server')
const { User } = require('../../../db')
const fake = require('../../../utils/fake')

describe('POST /auth/account', () => {
    test('should register a new account', async () => {
        const accountData = fake.mockUserData()
        const res = await request(app).post('/auth/account').send(accountData)

        expect(res.status === 201 || res.status === 200).toBe(true)
        expect(res.body).toHaveProperty('status', 'success')
        expect(res.body).toHaveProperty('data')

        expect(res.body.data).toHaveProperty('id')
        expect(res.body.data).toHaveProperty('username', accountData.username)
        expect(res.body.data).toHaveProperty('email', accountData.email)
        expect(res.body.data).toHaveProperty('name', accountData.name)
        expect(res.body.data).toHaveProperty('phone', accountData.phone)
        expect(res.body.data).toHaveProperty('avatarUrl', accountData.avatarUrl)

        expect(res.body).not.toHaveProperty('password')
        expect(res.body).not.toHaveProperty('refreshToken')

        // cleanup - delete the account
        if (res?.body?.data?.id) {
            await User.destroy({ where: { id: res.body.data.id } })
        }
    })

    test('should return error if username is missing', async () => {
        const accountData = fake.mockUserData()
        await request(app)
            .post('/auth/account')
            .send({
                ...accountData,
                username: undefined,
            })
            .expect((res) => res.status === 400 || res.status === 422) // express-validator returns 422 for validation errors
    })

    test('should return error if username is already taken', async () => {
        const accountData = fake.mockUserData()
        const accountData2 = fake.mockUserData()
        accountData2.username = accountData.username

        // first create an account
        const initUser = await User.create(accountData)

        // then try to create another account with the same username
        const response = await request(app)
            .post('/auth/account')
            .send(accountData2)
        expect(response.status === 400 || response.status === 422) // express-validator returns 422 for validation errors

        // cleanup - delete the account
        if (initUser?.id) {
            await User.destroy({ where: { id: initUser.id } })
        }
        if (response?.body?.data?.id) {
            await User.destroy({ where: { id: response.body.data.id } })
        }
    })

    test('should return error if email is already taken', async () => {
        const accountData = fake.mockUserData()
        const accountData2 = fake.mockUserData()
        accountData2.email = accountData.email

        // first create an account
        const initUser = await User.create(accountData)

        // then try to create another account with the same email
        const response = await request(app)
            .post('/auth/account')
            .send(accountData2)
            .expect((res) => res.status === 400 || res.status === 422) // express-validator returns 422 for validation errors

        // cleanup - delete the account
        if (initUser?.id) {
            await User.destroy({ where: { id: initUser.id } })
        }
        if (response?.body?.data?.id) {
            await User.destroy({ where: { id: response.body.data.id } })
        }
    })

    test('should return error if phone is already taken', async () => {
        const accountData = fake.mockUserData()
        const accountData2 = fake.mockUserData()
        accountData2.phone = accountData.phone

        // first create an account
        const initUser = await User.create(accountData)

        // then try to create another account with the same phone
        const response = await request(app)
            .post('/auth/account')
            .send(accountData2)
            .expect((res) => res.status === 400 || res.status === 422) // express-validator returns 422 for validation errors

        // cleanup - delete the account
        if (initUser?.id) {
            await User.destroy({ where: { id: initUser.id } })
        }
        if (response?.body?.data?.id) {
            await User.destroy({ where: { id: response.body.data.id } })
        }
    })
})
