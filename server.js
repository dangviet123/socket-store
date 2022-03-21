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

io.use(function (socket, next) { // check token
    if (socket.handshake.query && socket.handshake.query.token) { // check token gửi lên
        jwt.verify(socket.handshake.query.token, 'icGrWBMIsJN5FdAvELTvaAks0drAvnDgyYb50s3fmkrgFSziBT8Jo0wBvoVvJ4W9', function (err, decoded) {
            if (err) return next(new Error('Xác thực lỗi'));
            socket.decoded = decoded;
            next();
        });
    }
    else {
        next(new Error('Xác thực lỗi'));
    }
}).on('connection', (socket) => {

    try {
        console.log('người dùng connect');
        const user = socket.decoded;
        if (user) {
            clients = pushSocketIdToArray(clients, user.sub, socket.id);
            //console.log(clients);
        }

        // tất cả user online khi người dùng đăng nhập
        socket.emit('all-user-online', Object.keys(clients));
        socket.broadcast.emit('user-login', user.sub);

        // user đóng kết nối
        socket.on("disconnect", () => {
            clients = removeSocketIdToArray(clients, user.sub, socket);
            socket.broadcast.emit('user-logout', user.sub);

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