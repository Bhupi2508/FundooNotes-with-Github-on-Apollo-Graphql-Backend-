/**
 * Converts a caught error into the `{ message }` object every resolver returns.
 * Programmer errors (TypeError etc.) are logged but not leaked to the client.
 * (Replaces the old module-level `errorMessage` object that was mutated per request
 * and therefore shared between concurrent requests.)
 */
const logger = require('./logger');

exports.errorResponse = (err) => {
    logger.error('Resolver error: ' + (err && err.stack ? err.stack : err));
    if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
        return { message: 'Something bad happened' };
    }
    return { message: err && err.message ? err.message : 'Something bad happened' };
};
