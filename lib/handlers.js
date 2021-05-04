/**
 * Request handlers
 */

// Dependencies
const _data = require("./data");
const helpers = require("./helpers");

// Handler container
const handlers = {};

// Users handler
handlers.users = (data, callback) => {
    const acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

// User - post
// Required data: name, email, password,  streetAddress.
handlers._users.post = (data, callback) => {
    const name =
        typeof data.payload.name == "string" &&
        data.payload.name.trim().length > 0
            ? data.payload.name.trim()
            : false;

    const email =
        typeof data.payload.email == "string" &&
        data.payload.email.trim().length > 0
            ? data.payload.email.trim()
            : false;

    const password =
        typeof data.payload.password == "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;

    const streetAddress =
        typeof data.payload.streetAddress == "string" &&
        data.payload.streetAddress.trim().length > 0
            ? data.payload.streetAddress.trim()
            : false;

    if (name && email && password && streetAddress) {
        // Check if user already exist
        _data.read("users", email, function (err, data) {
            if (err) {
                const hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    const userObject = {
                        name: name,
                        email: email,
                        hashedPassword: hashedPassword,
                        streetAddress: streetAddress,
                    };

                    // Store the user
                    _data.create("users", email, userObject, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                Error: "Could not create new user",
                            });
                        }
                    });
                } else {
                    callback(500, {
                        Error: "Could not hash password",
                    });
                }
            } else {
                callback(500, { Error: "User already exist" });
            }
        });
    } else {
        callback(400, { Error: "Missing required field" });
    }
};

// Ping handler
handlers.ping = (data, callback) => callback(200);

// Not Found Handler
handlers.notFound = (data, callback) => callback(404);

module.exports = handlers;
