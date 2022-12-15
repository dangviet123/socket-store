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


            meeting.emit('user-login', clientsInfo);

            socket.on('send-logout-request', (data) => {
                if (data.length > 0) {
                    data.forEach(element => {
                        emitNotifyToArray(clients, element, meeting, 'send-logout-request', { logout: true });
                    });
                }
            });

            // gửi yêu cầu khóa hệ thống
            socket.on('admin-lock-system', (data) => {
                meeting.emit('admin-lock-system', {locked: true});
            });

            // // user đóng kết nối
            socket.on("disconnect", () => {
                socket.disconnect();
                clients = removeSocketIdToArray(clients, id, socket);
                clientsInfo = removeSocketIdToArrayInfo(clientsInfo, id, socket, socket.handshake);
                meeting.emit('user-logout', clientsInfo);
                if (!clients[id] && id !== 0) {
                    apis.post('ecommerce/auth/user-offline', { id_customer_oa: id });
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