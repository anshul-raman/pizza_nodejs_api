/**
 * Library for storing and editing file
 */

// Dependencies
const fs = require("fs");
const helpers = require("./helpers");
const path = require("path");


const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

// Write data to a file
lib.create = function (dir, file, data, callback) {
    // Open the file for writing
    fs.open(
        lib.baseDir + dir + "/" + file + ".json",
        "wx",
        function (err, fileDescriptor) {
            if (!err && fileDescriptor) {
                // Convert data to sring
                const stringData = JSON.stringify(data);

                // Write to file and close it
                fs.writeFile(fileDescriptor, stringData, function (err) {
                    if (!err) {
                        fs.close(fileDescriptor, function (err) {
                            if (!err) {
                                callback(false);
                            } else {
                                callback("Error closing new file");
                            }
                        });
                    } else {
                        callback("Error writing to new file");
                    }
                });
            } else {
                callback("Could not create a new file, it may already exist");
            }
        }
    );
};

// Read data from a file
lib.read = function (dir, fileName, callback) {
    fs.readFile(
        lib.baseDir + dir + "/" + fileName + ".json",
        "utf8",
        function (err, data) {
            if (!err && data) {
                const parsedData = helpers.parseJsonToObject(data);
                callback(false, parsedData);
            } else {
                callback(err, data);
            }
        }
    );
};

// Update data inside a file
lib.update = function (dir, file, data, callback) {
    // Open the file for writing
    fs.open(
        lib.baseDir + dir + "/" + file + ".json",
        "r+",
        function (err, fileDescriptor) {
            if (!err && fileDescriptor) {
                // Convert data to string
                const stringData = JSON.stringify(data);

                // Truncate the file
                fs.ftruncate(fileDescriptor, function (err) {
                    if (!err) {
                        // Write to file and close it
                        fs.writeFile(
                            fileDescriptor,
                            stringData,
                            function (err) {
                                if (!err) {
                                    fs.close(fileDescriptor, function (err) {
                                        if (!err) {
                                            callback(false);
                                        } else {
                                            callback("Error closing the file");
                                        }
                                    });
                                } else {
                                    callback(
                                        "Error writing to the existing file"
                                    );
                                }
                            }
                        );
                    } else {
                        callback("Error in truncating the file");
                    }
                });
            } else {
                callback(
                    "Could not open the file for updating, it may not exist"
                );
            }
        }
    );
};

// Delete a file
lib.delete = function (dir, file, callback) {
    // Unlink the file
    fs.unlink(lib.baseDir + dir + "/" + file + ".json", function (err) {
        if (!err) {
            callback(false);
        } else {
            callback("Error deleting the file");
        }
    });
};

module.exports = lib;
