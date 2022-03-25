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
      //methods: ["GET", "POST"]
    }
});
const {
    pushSocketIdToArray,
    emitNotifyToArray,
    pushSocketIdToArrayInfo,
    removeSocketIdToArrayInfo,
    removeSocketIdToArray,
} = require("./helper");


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
let clients = {};
let clientsInfo = {};
app.use(cors());
io.on('connection', (socket) => {
    //console.log("New Connection with transport", socket.conn.transport.name);
    try {   

        let id = socket.handshake.query.id;
        //.log(socket.handshake.headers);
        if (id) {
            clients = pushSocketIdToArray(clients, id, socket.id);
            clientsInfo = pushSocketIdToArrayInfo(clientsInfo, id, socket.id, socket.handshake);
        }

        // tất cả user online khi người dùng đăng nhập
        socket.emit('all-user-online', Object.keys(clients));

        socket.broadcast.emit('user-login', clientsInfo);



        socket.on('send-user-online', (userId) => {
            emitNotifyToArray(clients, userId, io, 'reciver-user-online', clientsInfo);
            //socket.emit('reciver-user-online', Object.keys(clients));
        })



        // user đóng kết nối
        socket.on("disconnect", () => {
            clients = removeSocketIdToArray(clients, id, socket);
            clientsInfo = removeSocketIdToArrayInfo(clientsInfo, id, socket, socket.handshake);
            socket.broadcast.emit('user-logout', clientsInfo);

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