const http = require("http");
const websocketServer = require("websocket").server;
const httpserver = http.createServer();

httpserver.listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
});
const clients = {};
const wsServer = new websocketServer({
    httpServer: httpserver,
});
wsServer.on("request", (request) => {
    const connection = request.accept(null, request.origin);
    connection.on("open", () => {
        console.log("Connection opened");
    });
    connection.on("message", (message) => {
        const result = JSON.parse(message.utf8Data);
        console.log(result);
    });
    connection.on("close", (connection) => {
        console.log("Connection closed");
    });

    const clientId = guid();
    clients[clientId] = {
        "connection" : connection
    }
    const payLoad = {
        "method" : "connect",
        "clientId" : clientId
    }
    connection.send(JSON.stringify(payLoad));
});
