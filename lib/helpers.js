/**
 * Helpers for various tasks 
 */


// Dependencies 


// Container for helpers 
const helpers = {}; 

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