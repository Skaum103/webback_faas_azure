const { app } = require('@azure/functions');
const User      = require('../models/User');
const session_lib = require('../lib/session')
const streamToJson = require('../utils/streamToJson');


app.http('login', {
    route: 'auth/login',
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
        const password = body.password
        if (!username || !password) {
            return {
                status: 400,
                body: 'Request must include { username, email, password }.'
            };
        }

        // 2) Verify credentials
        try {
            const user = await User.findByUsername(username)

            if (!user) {
                return { status: 500, body: 'Failed to find user' };
            }
            else if (user.password != password) {
                return { status: 401, body: 'Invalid Credentials' };
            }

        // 3) Create session
            const session = await session_lib.create_session(user.id)
            console.log(session)
            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "session_id" : session.session_id
                })
            };
        } catch (err) {
            return {
                status: 500,
                body: err
            };
        }
    }
});