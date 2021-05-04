/**
 * Helpers for various tasks
 */

// Dependencies

// Container for helpers
const helpers = {};
const crypto = require("crypto")
const config = require("./config")

// Create a SHA256 hash
helpers.hash = function (str) {
    if (typeof str == "string" && str.length > 0) {
        const hash = crypto
            .createHmac("sha256", config.hashingSecret)
            .update(str)
            .digest("hex");
        return hash;
    } else {
        return false;
    }
};

// Parse JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        console.log("Error in parsing JSON buffer", e);
        return {};
    }
};

module.exports = helpers;
