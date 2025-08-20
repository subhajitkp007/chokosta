const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
require('dotenv').config();

const app = express();
const server = http.Server(app);
const io = socketIo(server, {});

// Configuration
const PORT = process.env.PORT || 2000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_ID_RANGE = { 
    min: parseInt(process.env.CLIENT_ID_MIN || '1000'), 
    max: parseInt(process.env.CLIENT_ID_MAX || '10000') 
};
const GAME_ID_RANGE = { 
    min: parseInt(process.env.GAME_ID_MIN || '1000'), 
    max: parseInt(process.env.GAME_ID_MAX || '20000') 
};
const GAME_UPDATE_INTERVAL = parseInt(process.env.GAME_UPDATE_INTERVAL || '20000');

// In-memory storage (consider using Redis for production)
const SOCKET_LIST = {}; // clients
const games = {}; // game data

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.use('/', express.static(__dirname + '/'));

// Helper functions
function generateUniqueId(min, max, existingIds) {
    for (let i = min; i < max; i++) {
        if (!(i in existingIds)) {
            return i;
        }
    }
    throw new Error('No available IDs in range');
}

function generateRandomGameId() {
    const randomNum = Math.random() * (GAME_ID_RANGE.max - GAME_ID_RANGE.min) + GAME_ID_RANGE.min;
    return Math.ceil(randomNum);
}

function broadcastToGame(gameId, event, data) {
    if (!games[gameId] || !games[gameId].clients) return;
    
    games[gameId].clients.forEach(clientId => {
        if (SOCKET_LIST[clientId]) {
            SOCKET_LIST[clientId].emit(event, data);
        }
    });
}

function cleanupGame(gameId) {
    if (games[gameId]) {
        delete games[gameId];
    }
}

// Socket connection handling
io.sockets.on('connection', (socket) => {
    try {
        // Generate unique client ID
        socket.id = generateUniqueId(CLIENT_ID_RANGE.min, CLIENT_ID_RANGE.max, SOCKET_LIST);
        
        // Generate unique game ID
        let gameId = generateRandomGameId();
        if (gameId in games) {
            gameId = generateUniqueId(gameId, GAME_ID_RANGE.max, games);
        }
        socket.gid = gameId;
        
        // Store socket details
        SOCKET_LIST[socket.id] = socket;
        
        console.log(`User connected: ${socket.id}, Game ID: ${socket.gid}`);
        
        // Send initial data to client
        socket.emit('start', { cid: socket.id, gid: socket.gid });
        
        // Initialize game data
        games[socket.gid] = {
            clients: []
        };
    } catch (error) {
        console.error('Error during socket connection:', error);
        socket.emit('error', { message: 'Connection failed' });
    }
    // Game creation handler
    socket.on('create', (data) => {
        try {
            socket.gid = data.gid;
            const gameId = socket.gid;
            
            if (games[gameId]) {
                games[gameId] = {
                    ...games[gameId],
                    maxplayer: data.maxplayer,
                    pos: data.pos,
                    ghutipos: data.ghutipos,
                    win: 0,
                    namecreator: data.name,
                    clients: [data.cid]
                };
                console.log(`Game created: ${gameId} by ${data.name}`);
            } else {
                socket.emit('gamedeleted', data.pl1name);
            }
        } catch (error) {
            console.error('Error creating game:', error);
            socket.emit('error', { message: 'Failed to create game' });
        }
    });
    // Game join handler
    socket.on('join', (data) => {
        try {
            cleanupGame(socket.gid);
            
            if (!(data.gid in games)) {
                socket.emit('gamedeleted', data.pl1name);
                return;
            }
            
            const game = games[data.gid];
            if (!game || !game.clients || game.clients.length !== 1) {
                socket.emit('fulljoined', 'Game is full or not available');
                return;
            }
            
            // Join the game
            socket.gid = data.gid;
            game.clients.push(data.cid);
            game.namejoin = data.name;
            
            // Notify existing players
            broadcastToGame(data.gid, 'newjoin', data.name);
            
            // Start the game
            const gameStartData = {
                pid: '1',
                gid: data.gid,
                pl1name: game.namecreator,
                pl3name: game.namejoin
            };
            broadcastToGame(data.gid, 'startgame', gameStartData);
            
            console.log(`Player ${data.name} joined game ${data.gid}`);
        } catch (error) {
            console.error('Error joining game:', error);
            socket.emit('error', { message: 'Failed to join game' });
        }
    });
    // Move not done handler
    socket.on('movenotdone', (data) => {
        try {
            if (games[data.gid]) {
                broadcastToGame(data.gid, 'nextmove', data);
            }
        } catch (error) {
            console.error('Error handling movenotdone:', error);
        }
    });
    
    // Dice update handler
    socket.on('diceupdate', (data) => {
        try {
            const updatedData = { ...data };
            let targetClientIndex = 0;
            
            if (data.ply === 1) {
                updatedData.ply = 3;
                targetClientIndex = 1;
            } else {
                updatedData.ply = 1;
                targetClientIndex = 0;
            }
            
            const game = games[data.gid];
            if (game && game.clients && game.clients[targetClientIndex]) {
                const targetClient = SOCKET_LIST[game.clients[targetClientIndex]];
                if (targetClient) {
                    targetClient.emit('diceupdate', updatedData);
                }
            }
        } catch (error) {
            console.error('Error handling diceupdate:', error);
        }
    });
    
    // Move done handler
    socket.on('movedone', (data) => {
        try {
            const sendData = {
                ply: data.ply === 1 ? 3 : 1,
                pos: data.pos,
                g: data.g,
                gid: data.gid,
                boxes: data.boxes
            };
            
            broadcastToGame(data.gid, 'nextmove', sendData);
        } catch (error) {
            console.error('Error handling movedone:', error);
        }
    });
    
    // Game completion handler
    socket.on('complete', (data) => {
        try {
            if (games[data.gid]) {
                broadcastToGame(data.gid, 'complete', data);
                cleanupGame(data.gid);
            }
        } catch (error) {
            console.error('Error handling game completion:', error);
        }
    });
    
    // Chat message handler
    socket.on('chatmsg', (data) => {
        try {
            if (games[data.gid]) {
                broadcastToGame(data.gid, 'chatmsg', data);
            }
        } catch (error) {
            console.error('Error handling chat message:', error);
        }
    });
    // Socket disconnection handler
    socket.on('disconnect', () => {
        try {
            console.log(`User disconnected: ${socket.id}`);
            delete SOCKET_LIST[socket.id];
            
            if (socket.gid && games[socket.gid]) {
                cleanupGame(socket.gid);
            }
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
});

// Periodic update to clients
setInterval(() => {
    Object.values(SOCKET_LIST).forEach(socket => {
        if (socket && socket.emit) {
            socket.emit('update', games);
        }
    });
}, GAME_UPDATE_INTERVAL);

// Start server
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT} in ${NODE_ENV} mode`);
});
