const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const sockecio = require('socket.io');
const cors = require('cors');

var jwt = require('jsonwebtoken');
const io = sockecio(server, {
    cors: {
      origin: '*',
    }
});
const {
    pushSocketIdToArray,
    emitNotifyToArray,
    removeSocketIdToArray,
} = require("./helper");


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
let clients = {};
app.use(cors());
io.on('connection', (socket) => {
    
    try {   
        let id = socket.handshake.query.id;
        if (id) {
            clients = pushSocketIdToArray(clients, id, socket.id);
            //console.log(clients);
        }

        // tất cả user online khi người dùng đăng nhập
        socket.emit('all-user-online', Object.keys(clients));
        socket.broadcast.emit('user-login', Object.keys(clients));

        // user đóng kết nối
        socket.on("disconnect", () => {
            clients = removeSocketIdToArray(clients, id, socket);
            socket.broadcast.emit('user-logout', Object.keys(clients));

            console.log('người dùng đóng kết nối');

        });
    } catch (error) {
        console.log(error);
    }

    // test gửi data
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});