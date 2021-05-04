/*
 *Create and export configuration variables
 */

// Container for all enviornments
const enviornments = {};

// Staging (default) enviornment
enviornments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: "staging",
    hashingSecret: "thisisASecret",
    host: "localhost"


};

// Production enviornment
enviornments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: "production",
    hashingSecret: "thisisAsecret",
    host: "pizza.com"

};

// Determine which enviornment was passed as a command-line argument
const currentEnviornment =
    typeof process.env.NODE_ENV == "string"
        ? process.env.NODE_ENV.toLowerCase()
        : "";

// Check that the current enviornment is one of the enciornments above , if not default ot staging
const enviornmentToExport =
    typeof enviornments[currentEnviornment] == "object"
        ? enviornments[currentEnviornment]
        : enviornments.staging;

// Export the module
module.exports = enviornmentToExport;
