const { app } = require('@azure/functions');
const User      = require('../models/User');
const streamToJson = require('../utils/streamToJson');

app.http('register', {
    route: 'auth/register',
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (req, context) => {
        // 1) Parse JSON body
        let body = {};
        if (req.method === 'POST' && req.body) {
            try {
                body = await streamToJson(req.body);
                console.log(body)
            } catch (err) {
                context.log.error(err.message);
                return { status: 400, body: err.message };
            }
        }

        const username = body.username
        const email = body.email
        const password = body.password
        if (!username || !email || !password) {
            return {
                status: 400,
                body: 'Request must include { username, email, password }.'
            };
        }

        // 2) Insert into Users
        try {
            const created = await User.create({
                username,
                email,
                password
            })

            if (!created) {
                return { status: 500, body: 'Failed to create user' };
            }

            return {
                status: 201,
                body: 'User successfully created'
            };
        } catch (err) {
            return {
                status: 500,
                body: err
            };
        }
    }
});