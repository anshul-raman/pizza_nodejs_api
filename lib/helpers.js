/**
 * Helpers for various tasks
 */

// Dependencies

// Container for helpers
const helpers = {};
const crypto = require("crypto");
const config = require("./config");
const util = require("util");
const debug = util.debuglog("debug");

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

helpers.createRandomString = function (strLength) {
    strLength =
        typeof strLength == "number" && strLength > 0 ? strLength : false;

    if (strLength) {
        // Define all the possible characters
        const possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

        // Start the final string
        let str = "";
        for (let i = 1; i <= strLength; i++) {
            // Get a random character from the possible character
            let randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );

            // Append this character to the final sring
            str += randomCharacter;
        }
        return str;
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
        // debug("Error in parsing JSON buffer", e);
        return {};
    }
};

module.exports = helpers;
