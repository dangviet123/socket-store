const {
    pushSocketIdToArray,
    emitNotifyToArray,
    pushSocketIdToArrayInfo,
    removeSocketIdToArrayInfo,
    removeSocketIdToArray,
} = require("./helper");




const zaloOaSocket = (io) => {
    let clients = {};
    let oa = io.of("/zaloOa");
    oa.on('connection', (socket) => {
        try {
            let id = socket.handshake.query.id;
            if (id !== 0) {
                clients = pushSocketIdToArray(clients, id, socket.id);
            }


            oa.emit('user-login', clients);

            socket.on('send-logout-request', (data) => {
                if (data.length > 0) {
                    data.forEach(element => {
                        emitNotifyToArray(clients, element, oa, 'send-logout-request', { logout: true });
                    });
                }
            });


            /**
             * nhận tin nhắn zalo
             */
            socket.on('zalo-oa-message', (data) => {
                oa.emit('zalo-oa-message', JSON.parse(data.data));
            });


            // // user đóng kết nối
            socket.on("disconnect", () => {
                socket.disconnect();
                clients = removeSocketIdToArray(clients, id, socket);
                oa.emit('user-logout', clients);
                
            });
        } catch (error) {
            console.log(error);
        }
    });
}

module.exports = {
    zaloOaSocket
}