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
                if (id !== 0) {
                    clients = pushSocketIdToArray(clients, id, socket.id);
                    clientsInfo = pushSocketIdToArrayInfo(clientsInfo, id, socket.id, socket.handshake);
                }
                
            


            // socket.emit('all-user-online', Object.keys(clients));

            meeting.emit('user-login', clientsInfo);
    
            // socket.on('send-user-online', (userId) => {
            //     emitNotifyToArray(clients, userId, meeting, 'reciver-user-online', clientsInfo);
            // })
    
            // // user đóng kết nối
            socket.on("disconnect", () => {
                socket.disconnect();
                clients = removeSocketIdToArray(clients, id, socket);
                clientsInfo = removeSocketIdToArrayInfo(clientsInfo, id, socket, socket.handshake);
                meeting.emit('user-logout', clientsInfo);
                if (!clients[id] && id !== 0) {
                    apis.post('ecommerce/auth/user-offline', {id_customer_oa: id});
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