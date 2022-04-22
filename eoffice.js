const {
    pushSocketIdToArray,
    emitNotifyToArray,
    pushSocketIdToArrayInfo,
    removeSocketIdToArrayInfo,
    removeSocketIdToArray,
} = require("./helper");

const apis = require('./apiConfig');

const userOnlineEoffice = (io) => {
    let clients = {};
    let clientsInfo = {};
    io.on('connection', (socket) => {
        //console.log(socket);
        try {   
            let id = socket.handshake.query.id;
            if (id) {
                clients = pushSocketIdToArray(clients, id, socket.id);
                clientsInfo = pushSocketIdToArrayInfo(clientsInfo, id, socket.id, socket.handshake);
            }
            // tất cả user online khi người dùng đăng nhập
            //socket.emit('all-user-online', Object.keys(clients));
    
            socket.broadcast.emit('user-login', clientsInfo);
            


            socket.on('send-user-online', (userId) => {
                emitNotifyToArray(clients, userId, io, 'reciver-user-online', clientsInfo);
                //socket.emit('reciver-user-online', Object.keys(clients));
            });


            socket.on('send-logout-request', (data) => {
                if (data.length > 0) {
                    data.forEach(element => {
                        emitNotifyToArray(clients, element, io, 'reciver-user-online', {logout: true});
                    });
                    
                }
            })


    
            // user đóng kết nối
            socket.on("disconnect", () => {
                socket.disconnect();
                clients = removeSocketIdToArray(clients, id, socket);
                clientsInfo = removeSocketIdToArrayInfo(clientsInfo, id, socket, socket.handshake);

                socket.broadcast.emit('user-logout', clientsInfo);

                if (!clients[id] && id !== 0) {
                    apis.post('auth/user-offline', {id_user: id});
                }
    
            });
        } catch (error) {
            console.log(error);
        }
    
    
    
        // test gửi data
        socket.on('chat message', (msg) => {
            console.log(msg);
            io.emit('chat message', msg);
        });
    });
}

module.exports = {
    userOnlineEoffice
}