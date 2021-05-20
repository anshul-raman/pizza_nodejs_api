/**
 * Primary file for the API
 */

// Dependencies
const helpers = require("./lib/helpers");
const server = require("./lib/server");

// Declare the app
const app = {};

// Init function
app.init = () => {
    // Check directory structure for storing data
    helpers.createStorageDirectory((err) => {
        if (err) {
            console.log(err);
        } else {
            // Start server
            server.init();
        }
    });
};

// Execute the app
app.init();

// Export the app
module.exports = app;
