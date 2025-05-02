const { app } = require('@azure/functions');
const { v4: uuid } = require('uuid');
const Session      = require('../models/Session');
const streamToJson = require('../utils/streamToJson');

app.http('session', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (req, context) => {
    /**
        * HTTP /api/session
        * POST  ?sessionId=<id>       → verify if that session exists & is unexpired
        * POST { userId: "<userId>" } → create a new 3-day session for that user
    */ 
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

        try {
            // 1) Verify existing session
            const sessionId = body.sessionId
            if (sessionId) {
                const session = await Session.findById(sessionId);
                if (!session) {
                    return { status: 404, body: { valid: false, message: 'Session not found' } };
                } else if (new Date(session.expires_at) < new Date()) {
                    return { status: 401, body: { valid: false, expired: true } };
                } else {
                    return { status: 200, body: { valid: true, session } };
                }
                return;
            }
    
            // 2) Create new session
            const userId = body.userId
            if (userId) {
                const newSessionId = uuid();
                const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
                    
                const created = await Session.create({
                    sessionId: newSessionId,
                    userId,
                    expiresAt
                });
            
                if (!created) {
                    return { status: 500, body: 'Failed to create session' };
                }
    
                return {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: newSessionId,
                    })
                };
            }

    
            // 3) Bad request if neither provided
            return {
                status: 400,
                body: 'Please provide either a sessionId (to verify) or a userId (to create).'
            };
  
        } catch (err) {
            return {
                status: 500,
                body: err
            };
        }
    }
});