const http = require("http");
const websocketServer = require("websocket").server;
const httpserver = http.createServer();
var count_of_clients=0;
var mySet=new Set();
var games={};
httpserver.listen(3001, () => {
    console.log("Server running at http://localhost:3001/");
});
const clients = {};
const wsServer = new websocketServer({
    httpServer: httpserver,
});
wsServer.on("request", (request) => {
    const connection = request.accept(null, request.origin);
    connection.on("open", () => {
        console.log("Client connected, PLEASE LOOK OUT FOR THIS LINE IN THE CONSOLE !!!!!!!!!!!!!")
        console.log("Connection opened");
    });
    connection.on("message", (message) => {
        console.log("Received Message:", message.utf8Data);
        const receivedData = JSON.parse(message.utf8Data);
        console.log(receivedData)
        if (receivedData.method === 'createGame') {
            const gameID = guid();
            const clientID = cuid();
            const payLoad = {
                method: "connectGame",
                gameID,
                clientID,
            };
            if(games[String(gameID)] === undefined){
                games[String(gameID)] = {
                    numberOfPlayers: 1,
                    players: {
                        [String(clientID)]:{
                        "health": 100,
                        "position": [0, 0, 0],
                        "quaternion": [0, 0, 0, 0],
                        "kills": 0,
                        connection: connection,
                        }
                    }
                };
            }
            console.log(games);
            console.log(games[String(gameID)].players[clientID]);
            connection.send(JSON.stringify(payLoad));
        }
        if(receivedData.method === 'joinGame'){
            const clientID = cuid();
            if(games[String(receivedData.gameID)] != undefined){
                var payLoad={};
                games[String(receivedData.gameID)].numberOfPlayers++;
                console.log(games[String(receivedData.gameID)].numberOfPlayers);
                if(games[String(receivedData.gameID)].numberOfPlayers === 2){
                    payLoad.startGame = true;
                }
                games[String(receivedData.gameID)].players[clientID] = {
                    "health": 100,
                    "position": [0, 0, 0],
                    "quaternion": [0, 0, 0, 0],
                    "kills": 0,
                };
                 payLoad = {
                    method: "connectGameThroughJoin",
                    gameID: receivedData.gameID,
                    clientID,
                };
            }
            connection.send(JSON.stringify(payLoad));
        }
        else if(receivedData.method === 'update'){
            console.log("update method called");
            console.log(receivedData);
            console.log(games[String(receivedData.gameID)].players[receivedData.clientID]);
            games[String(receivedData.gameID)].players[receivedData.clientID].position = receivedData.position;
            games[String(receivedData.gameID)].players[receivedData.clientID].quaternion = receivedData.quaternion;
            games[String(receivedData.gameID)].players[receivedData.clientID].health = receivedData.health;
            games[String(receivedData.gameID)].players[receivedData.clientID].kills = receivedData.kills;
            for (const playerID in games[String(receivedData.gameID)].players) {
                if (playerID !== receivedData.clientID) {
                    games[String(receivedData.gameID)].players[playerID].connection.send(JSON.stringify(games));
                }
            }
        }
    });
    connection.on("close", (connection) => {
        console.log("Connection closed");
    });
    connection.on("error", (error) => {
        // console.error("WebSocket Error:", error);
    });
    
    const clientID = cuid();
    const gameID = guid();
    clients[clientID] = {
        "connection" : connection
    }
    const payLoad = {
        "method" : "connect",
        "clientID" : clientID,
        "gameID": gameID,
    }
    connection.send(JSON.stringify(payLoad));
});


function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// then to call it, plus stitch in '4' in the third group
const cuid = () => (S4() + S4() + "-" + S4() + "-4" + S4().slice(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
const guid = () => (S4() ).toLowerCase();