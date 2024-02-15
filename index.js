const http = require("http");
const websocketServer = require("websocket").server;
const httpserver = http.createServer();
var count_of_clients=0;
var mySet=new Set();
var games={};
var client_ID=new Set();
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
        console.log("Received Message:", message.utf8Data);
        const receivedData = JSON.parse(message.utf8Data);
        console.log(receivedData)
        if (receivedData.method === 'createGame') {
            const gameID = guid();
            const clientId = cuid();
            const payLoad = {
                method: "connectGame",
                gameID,
                clientId,
            };
            // console.log(payLoad)
            if(games[String(gameID)] === undefined){
                games[String(gameID)] = {
                    numberOfPlayers: 1,
                    players: {
                        [String(clientId)]:{
                        "health": 100,
                        "position": [0, 0, 0],
                        "quaternion": [0, 0, 0, 0],
                        "kills": 0,
                        }
                    }
                };
            }
            console.log(games[String(gameID)].players[clientId]);
            client_ID.add(clientId);
            connection.send(JSON.stringify(payLoad));
        }
        if(receivedData.method === 'joinGame'){
            const clientId = cuid();
            const payLoad = {
                method: "JoinGame",
                gameID: receivedData.gameID,
                clientId,
            };
            console.log(payLoad);
            games[String(receivedData.gameID)].numberOfPlayers++;
            if(games[String(receivedData.gameID)].numberOfPlayers === 2){
                payLoad.startGame = true;
            }
            games[String(receivedData.gameID)].players[clientId] = {
                "health": 100,
                "position": [0, 0, 0],
                "quaternion": [0, 0, 0, 0],
                "kills": 0,
            };
            connection.send(JSON.stringify(payLoad));
        }
    });
    connection.on("close", (connection) => {
        console.log("Connection closed");
    });
    connection.on("error", (error) => {
        // console.error("WebSocket Error:", error);
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
const cuid = () => (S4() + S4() + "-" + S4() + "-4" + S4().slice(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
const guid = () => (S4() ).toLowerCase();