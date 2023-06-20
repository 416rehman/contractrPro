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
        return request(app)
            .post('/auth/account')
            .send(accountData)
            .expect(201)
            .then((res) => {
                // should have {
                //     status: 'success',
                //     data: {
                //         id: '...',
                //         refreshToken: '...'
                //     }
                // }
                expect(res.body.status).toBe('success')
                expect(res.body.data).toHaveProperty('id')
                expect(res.body.data).toHaveProperty('refreshToken')
                expect(res.body.data).not.toHaveProperty('password')
            })
    })

    test('should return error if username is missing', async () => {
        return request(app)
            .post('/auth/account')
            .send({
                ...accountData,
                username: undefined,
            })
            .expect(422) // express-validator returns 422 for validation errors
            .then((res) => {
                // should return array of errors like [{...}...]
                expect(res.body.errors).toBeInstanceOf(Array)
            })
    })

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
        request(app)
            .post('/auth/account')
            .send(accountData)
            .then(() => {
                // then try to create another account with the same username
                return request(app)
                    .post('/auth/account')
                    .send(accountData2)
                    .expect(422) // express-validator returns 422 for validation errors
                    .then((res) => {
                        expect(res.body.errors).toBeInstanceOf(Array)
                    })
            })
    })

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
        request(app)
            .post('/auth/account')
            .send(accountData)
            .then(() => {
                // then try to create another account with the same email
                return request(app)
                    .post('/auth/account')
                    .send(accountData2)
                    .expect(422) // express-validator returns 422 for validation errors
                    .then((res) => {
                        expect(res.body.errors).toBeInstanceOf(Array)
                    })
            })
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
        request(app)
            .post('/auth/account')
            .send(accountData)
            .then(() => {
                // then create another account with the same phone number
                return request(app)
                    .post('/auth/account')
                    .send(accountData2)
                    .expect(422) // express-validator returns 422 for validation errors
                    .then((res) => {
                        expect(res.body.errors).toBeInstanceOf(Array)
                    })
            })
    })
})
