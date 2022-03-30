const {
    pushSocketIdToArray,
    emitNotifyToArray,
    pushSocketIdToArrayInfo,
    removeSocketIdToArrayInfo,
    removeSocketIdToArray,
} = require("./helper");


const apis = require('./apiConfig');


const storeSocket = (io) => {
    let clients = {};
    let clientsInfo = {};
    let meeting = io.of("/store");
    meeting.on('connection', (socket) => {
        try {   
            let id = socket.handshake.query.id;
            if (id) {
                clients = pushSocketIdToArray(clients, id, socket.id);
                clientsInfo = pushSocketIdToArrayInfo(clientsInfo, id, socket.id, socket.handshake);
            }
            socket.emit('all-user-online', Object.keys(clients));

            socket.broadcast.emit('user-login', clientsInfo);
    
            socket.on('send-user-online', (userId) => {
                emitNotifyToArray(clients, userId, meeting, 'reciver-user-online', clientsInfo);
            })
    
            // user đóng kết nối
            socket.on("disconnect", () => {
                socket.disconnect();
                if (id) {
                    clients = removeSocketIdToArray(clients, id, socket);
                    clientsInfo = removeSocketIdToArrayInfo(clientsInfo, id, socket, socket.handshake);
                    socket.broadcast.emit('user-logout', clientsInfo);
                    console.log(clients);
                }
                
            });
        } catch (error) {
            console.log(error);
        }
    });
}

module.exports = {
    storeSocket
}