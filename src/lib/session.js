const { v4: uuid } = require('uuid');
const Session      = require('../models/Session');

// src/lib/auth.js
async function validate_session(session_id) {
    try {
        // 1) Verify existing session
        const session = await Session.findById(session_id);
        if (!session) {
            return false;
        } else if (new Date(session.expires_at) < new Date()) {
            return false;
        } else {
            return true;
        }
        // 2) Bad request if neither provided
        return false
    } catch (err) {
        return err
    }
}

async function create_session(user_id) {
    const newsession_id = uuid();
    const expires_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
        
    try{
        const session = await Session.create({
            session_id: newsession_id,
            user_id,
            expires_at
        });
        
        if (!session) {
            return 500;
        }
        return session

    } catch (err) {
        return err
    }
}

async function delete_session(session_id) {
    try {
        return await Session.delete(session_id);
    } catch(err) {
        return err
    }
}
  
  module.exports = { validate_session, create_session, delete_session };