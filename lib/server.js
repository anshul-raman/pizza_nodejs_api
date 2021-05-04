/**
 *  Server related task
 */

// Dependencies
const http = require("http");
const { URL } = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const handlers = require("./handlers");
const helpers = require("./helpers");
const config = require("./config")
const util = require("util");
const debug = util.debuglog("server");

// Initialise server to export
const server = {};

server.httpServer = http.createServer(function (req, res) {
    // Get the URL and parse it
    const parseUrl = new URL(req.url, "http://" + config.host + "/");

    // Get path
    const path = parseUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");

    // Get query string
    const queryStringObject = parseUrl.searchParams;

    // Get headers
    const headers = req.headers;

    // Get method
    const method = req.method.toLowerCase();

    // Get the payload, if any
    const decoder = new StringDecoder("utf-8");
    let buffer = "";

    req.on("data", function (data) {
        buffer += decoder.write(data);
    });

    req.on("end", function () {
        buffer += decoder.end();

        // Choose the handler this request should go to
        const chosenHandler =
            typeof server.router[trimmedPath] !== "undefined"
                ? server.router[trimmedPath]
                : handlers.notFound;

        const data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer),
        };

        debug(data);

        chosenHandler(data, function (statusCode, payload) {
            debug("INSIDE HANDLER", statusCode, payload);

            // Use the status code called back by the handler ot default to 200
            statusCode = typeof statusCode === "number" ? statusCode : 200;

            // Use the payload called back by the handler or default to empty
            payload = typeof payload === "object" ? payload : {};

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);

            res.setHeader("Content-Type", "application/json");
            res.writeHead(statusCode);
            res.end(payloadString);

            // If response is 200, print green, otherwise red
            if (statusCode == 200) {
                debug(
                    "\x1b[32m%s\x1b[0m",
                    method.toUpperCase() + " /" + trimmedPath + " " + statusCode
                );
            } else {
                debug(
                    "\x1b[31m%s\x1b[0m",
                    method.toUpperCase() + " /" + trimmedPath + " " + statusCode
                );
            }
        });
    });
});

// Define a request router
server.router = {
    ping: handlers.ping,
    users: handlers.users
};

server.init = function () {
    // Start http server
    server.httpServer.listen(3000, function () {
        console.log(
            "\x1b[36m%s\x1b[0m",
            "HTTP Server is listening on port " + 3000
        );
    });
};

// Export server
module.exports = server;
