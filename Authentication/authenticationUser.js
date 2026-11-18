/**
 * JWT helpers shared by every resolver.
 *
 * Tokens are signed with SECRET_KEY and passed to the API as the `?token=` query
 * parameter (see the Apollo `context` in server.js).
 */
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server');
const logger = require('../services/logger');

/** Lifetimes: login/GitHub tokens last a day, email-link tokens one hour. */
const SESSION_TTL = '1d';
const LINK_TTL = '1h';

/**
 * Sign a payload with the server secret.
 * @param {Object} payload
 * @param {String} [expiresIn]
 */
exports.sign = (payload, expiresIn = SESSION_TTL) => {
    if (!process.env.SECRET_KEY) {
        throw new Error('SECRET_KEY is not configured');
    }
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
};

/**
 * Verify a token.
 * @returns {Object|null} decoded payload, or null when the token is missing/invalid/expired.
 *   (Callers rely on a falsy result meaning "not authenticated".)
 */
exports.verification = (token) => {
    if (!token || !process.env.SECRET_KEY) return null;
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
        logger.warn('Token verification failed: ' + err.message);
        return null;
    }
};

/**
 * Require a logged-in user (token carrying a userID).
 * @returns {Object} decoded payload with `userID`
 * @throws {AuthenticationError}
 */
exports.requireUser = (context) => {
    const payload = exports.verification(context && context.token);
    if (!payload || !payload.userID) {
        throw new AuthenticationError('A valid login token is required');
    }
    return payload;
};

/**
 * Verification / reset tokens are emailed to the user and must not be handed back
 * in API responses (that would bypass the inbox check). The test-suite has no
 * mailbox, so it gets them in the response when NODE_ENV=test.
 */
exports.tokenForResponse = (token) => (process.env.NODE_ENV === 'test' ? token : undefined);

/** Escape user input before using it in a RegExp (prevents regex injection / ReDoS). */
exports.escapeRegex = (text) => String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
