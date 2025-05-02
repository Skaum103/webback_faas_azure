const { app } = require('@azure/functions');
const session_lib = require('../lib/session')
const streamToJson = require('../utils/streamToJson');

app.http('logout', {
    route: 'auth/logout',
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

        const session_id = body.session_id

        if(!session_id) {
            return { status: 400, body: 'Please provide valid session.' };
        }
        try {
           const res = await session_lib.delete_session(session_id)
           return { status: 200, body: 'Logout sucessful.' };
        } catch (err) {
            return err
        }
    }
});