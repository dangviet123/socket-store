const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const sockecio = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const socketioJwt = require('socketio-jwt');
const { userOnlineEoffice } = require('./eoffice');
const { storeSocket } = require('./store');

const io = sockecio(server, {
    cors: {
      origin: '*',
      methods: ["GET", "POST"]
    }
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(cors());

userOnlineEoffice(io);
storeSocket(io);


server.listen(3003, () => {
    console.log('listening on *:3003');
});