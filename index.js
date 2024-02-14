const http = require("http");
const app = require("express")();
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


function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().slice(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
 