/**
 * Request handlers
 */

// Dependencies

// Handler container
const handlers = {};

// Ping handler
handlers.ping = (data, callback) => callback(200);

// Not Found Handler
handlers.notFound = (data, callback) => callback(404);

module.exports = handlers;
