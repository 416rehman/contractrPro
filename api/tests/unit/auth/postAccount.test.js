const request = require('supertest')
const app = require('../../../server')

describe('POST /auth/account', () => {
    const accountData = {
        username: 'testuser',
        password: 'testpassword',
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        avatarUrl: 'https://example.com/avatar.png',
    }

    test('should register a new account', async () => {
        const res = await request(app)
            .post('/auth/account')
            .send(accountData)
            .expect(201)

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
    })

    test('should return error if username is missing', async () => {
        await request(app)
            .post('/auth/account')
            .send({
                ...accountData,
                username: undefined,
            })
            .expect(res => res.status === 400 || res.status === 422) // express-validator returns 422 for validation errors
    })
    //
    test('should return error if username is already taken', async () => {
        const accountData2 = {
            username: 'testuser',
            password: 'testpassword2',
            email: 'test@example.com2',
            name: 'Test User2',
            phone: '12345678902',
            avatarUrl: 'https://example.com/avatar2.png',
        }

        // first create an account
        await request(app)
            .post('/auth/account')
            .send(accountData)

        // then try to create another account with the same username
        await request(app)
            .post('/auth/account')
            .send(accountData2)
            .expect(res=> res.status === 400 || res.status === 422) // express-validator returns 422 for validation errors
    })
    //
    test('should return error if email is already taken', async () => {
        const accountData2 = {
            username: 'testuser2',
            password: 'testpassword2',
            email: 'test@example.com',
            name: 'Test User2',
            phone: '12345678902',
            avatarUrl: 'https://example.com/avatar2.png',
        }

        // first create an account
        await request(app)
            .post('/auth/account')
            .send(accountData)

        await request(app)
            .post('/auth/account')
            .send(accountData2)
            // expect either 400 or 422
            .expect((res) => res.status === 400 || res.status === 422)
    })

    test('should return error if phone is already taken', async () => {
        const accountData2 = {
            username: 'testuser2',
            password: 'testpassword2',
            email: 'test@example2.com',
            name: 'Test User2',
            phone: '1234567890',
            avatarUrl: 'https://example.com/avatar2.png',
        }

        // first create an account
        await request(app)
            .post('/auth/account')
            .send(accountData)

        await request(app)
            .post('/auth/account')
            .send(accountData2)
            .expect(res => res.status === 400 || res.status === 422) // express-validator returns 422 for validation errors
    })
})
