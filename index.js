/**
 * Primary file for the API
 */

// Dependencies
const server = require("./lib/server")

// Declare the app
const app = {};

// Init function
app.init = () => {
    // Start server
    server.init();


    // Add other services initialisers here
};

// Execute the app
app.init();




// Export the app
module.exports = app; 
