/**
 * Request handlers
 */

// Dependencies
const _data = require("./data");
const helpers = require("./helpers");
const util = require("util");
const debug = util.debuglog("handler");

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
                            debug(err);
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

// User - get
// Required data: email
// Required token head
handlers._users.get = (data, callback) => {
    const email =
        typeof data.payload.email == "string" &&
        data.payload.email.trim().length > 0
            ? data.payload.email.trim()
            : false;

    if (email) {
        const token =
            typeof data.headers.token == "string" ? data.headers.token : false;

        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            if (tokenIsValid) {
                _data.read("users", email, function (err, data) {
                    if (!err && data) {
                        // Remove hashed password from the user object before returning
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(403, { Error: "Token error" });
            }
        });
    } else {
        callback(400, { Error: "MIssing Required field" });
    }
};

// Users - put
// Required data: email
// Optional: name, email, password, streetAddress (atleast one)
// Required token head
handlers._users.put = function (data, callback) {
    // Check for the required field
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

    // Error if phone is invalid
    if (email) {
        if (name || password || streetAddress) {
            // Lookup the user

            // Get the token from the header
            const token =
                typeof data.headers.token == "string"
                    ? data.headers.token
                    : false;

            // Verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
                if (tokenIsValid) {
                    _data.read("users", email, function (err, userData) {
                        if (!err && userData) {
                            // Update the field necessary
                            if (name) {
                                userData.name = name;
                            }

                            if (streetAddress) {
                                userData.streetAddress = streetAddress;
                            }

                            if (password) {
                                userData.hashedPassword = helpers.hash(
                                    password
                                );
                            }

                            _data.update(
                                "users",
                                email,
                                userData,
                                function (err) {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        console.log(err);
                                        callback(500, {
                                            Error: "Could not update",
                                        });
                                    }
                                }
                            );
                        } else {
                            callback(400, {
                                Error: "specified user does not exist",
                            });
                        }
                    });
                } else {
                    callback(403, { Error: "Token error" });
                }
            });
        } else {
            callback(400, { Error: "atleast one filed required" });
        }
    } else {
        callback(400, { Error: "Invalid Email" });
    }
};

// Users - delete
// Required field: email
// Required token head
handlers._users.delete = function (data, callback) {
    // Check that phone number is valid
    const email =
        typeof data.payload.email == "string" &&
        data.payload.email.trim().length > 0
            ? data.payload.email.trim()
            : false;
    if (email) {
        // Get token from headers
        const token =
            typeof data.headers.token == "string" ? data.headers.token : false;

        // Verify that the given token is valid for the email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read("users", email, function (err, userData) {
                    if (!err && userData) {
                        // Delete the user's data
                        _data.delete("users", email, function (err) {
                            if (!err) {
                                // Delete each of the checks associated with the user
                                const userChecks =
                                    typeof userData.checks == "object" &&
                                    userData.checks instanceof Array
                                        ? userData.checks
                                        : [];
                                const checksToDelete = userChecks.length;
                                if (checksToDelete > 0) {
                                    let checksDeleted = 0;
                                    let deletionErrors = false;
                                    // Loop through the checks
                                    userChecks.forEach(function (checkId) {
                                        // Delete the check
                                        _data.delete(
                                            "checks",
                                            checkId,
                                            function (err) {
                                                if (err) {
                                                    deletionErrors = true;
                                                }
                                                checksDeleted++;
                                                if (
                                                    checksDeleted ==
                                                    checksToDelete
                                                ) {
                                                    if (!deletionErrors) {
                                                        callback(200);
                                                    } else {
                                                        callback(500, {
                                                            Error:
                                                                "Errors encountered while attempting to delete all of the user's checks. All checks may not have been deleted from the system successfully.",
                                                        });
                                                    }
                                                }
                                            }
                                        );
                                    });
                                } else {
                                    callback(200);
                                }
                            } else {
                                callback(500, {
                                    Error:
                                        "Could not delete the specified user",
                                });
                            }
                        });
                    } else {
                        callback(400, {
                            Error: "Could not find the specified user.",
                        });
                    }
                });
            } else {
                callback(403, {
                    Error:
                        "Missing required token in header, or token is invalid.",
                });
            }
        });
    } else {
        callback(400, { Error: "Missing required field" });
    }
};

// Tokens
handlers.tokens = (data, callback) => {
    const acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for all the token methods
handlers._tokens = {};

// Tokens - post
// Required data: email, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    const email =
        typeof data.payload.email == "string"
            ? data.payload.email.trim()
            : false;

    const password =
        typeof data.payload.password == "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;

    if (email && password) {
        // Lookup the user who mathces that email

        _data.read("users", email, function (err, userData) {
            if (!err && userData) {
                // Hash the sent password and compare it to the password stored in the user object
                const hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // If valid, create a new token with a random name. Set expiration date 1hour in the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        email: email,
                        expires: expires,
                        id: tokenId,
                    };

                    // Store the token
                    _data.create(
                        "tokens",
                        tokenId,
                        tokenObject,
                        function (err) {
                            if (!err) {
                                callback(200, tokenObject);
                            } else {
                                callback(500, {
                                    Error: "Could not create new token",
                                });
                            }
                        }
                    );
                } else {
                    callback(400, { Error: "Password did not match" });
                }
            } else {
                debug(err);
                callback(400, { Error: "Could not find the specified user" });
            }
        });
    } else {
        callback(400, { Error: "Missing required fields" });
    }
};

// Tokens - get
// Required data: id
handlers._tokens.get = (data, callback) => {
    // Check id is valid
    const id =
        typeof data.queryStringObject.id == "string" &&
        data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;

    if (id) {
        // Looup the token
        _data.read("tokens", id, function (err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { Error: "Missing Required field" });
    }
};

// Tokens - put
// Required data : id, extend
handlers._tokens.put = (data, callback) => {
    const id =
        typeof data.payload.id == "string" &&
        data.payload.id.trim().length == 20
            ? data.payload.id.trim()
            : false;

    const extend =
        typeof data.payload.extend == "boolean" ? data.payload.extend : false;

    if (id && extend) {
        // Lookup token
        _data.read("tokens", id, function (err, tokenData) {
            if (!err && tokenData) {
                // Check to make sure token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set epiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update("tokens", id, tokenData, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                Error: "Could not update token expiration",
                            });
                        }
                    });
                } else {
                    debug(err);
                    callback(400, { Error: "Token already expired" });
                }
            } else {
                debug(err);
                callback(400, { Error: "Invalid Token" });
            }
        });
    } else {
        callback(400, { Error: "Missing required fields or invalid fields" });
    }
};

// Tokens - delete
// Required data: id
handlers._tokens.delete = (data, callback) => {
    // Check that token is valid
    const id =
        typeof data.queryStringObject.id == "string" &&
        data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;

    if (id) {
        _data.read("tokens", id, function (err, data) {
            if (!err && data) {
                _data.delete("tokens", id, function (err, data) {
                    if (!err) {
                        callback(200);
                    } else {
                        debug(err);
                        callback(500, { Error: "COuld not delete" });
                    }
                });
            } else {
                debug(err);
                callback(400, { Error: "Not found" });
            }
        });
    } else {
        debug("Error with id: ", id);
        callback(400, { Error: "MIssing Required field" });
    }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, email, callback) => {
    // Lookup the token
    _data.read("tokens", id, function (err, tokenData) {
        debug(email, tokenData);
        if (!err && tokenData) {
            // Check that token is for given user and not expired
            if (tokenData.email === email && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            debug(err);
            callback(false);
        }
    });
};

// Ping handler
handlers.ping = (data, callback) => callback(200);

// Not Found Handler
handlers.notFound = (data, callback) => callback(404);

module.exports = handlers;
