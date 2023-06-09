const {
    pushSocketIdToArray,
    emitNotifyToArray,
    pushSocketIdToArrayInfo,
    removeSocketIdToArrayInfo,
    removeSocketIdToArray,
} = require("./helper");




const zaloOaSocket = (io) => {
    let userJoinRooms = []; // danh sánh người dùng vào  danh sách chat
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
            oa.emit('user-receive-support', userJoinRooms);

            socket.on('user-receive-support', (data, flag) => {
                userJoinRooms = userJoinRooms.filter(it => it.id_user !== data.id_user);

                //  room chưa thuộc người nào
                if (userJoinRooms.filter(it => it.user_id === data.user_id && it.active === true).length === 0) {
                    userJoinRooms.push({...data, active: true});
                }else if (flag) {
                    userJoinRooms = userJoinRooms.filter(it => it.user_id === data.user_id).map((item) => {
                        return {...item, active: false};
                    }).concat(userJoinRooms.filter(it => it.user_id !== data.user_id));

                    userJoinRooms.push({...data, active: true});
                }else {
                    userJoinRooms.push({...data, active: false});
                }

                

                
                oa.emit('user-receive-support', userJoinRooms);
            });

            // người dùng rời khỏi nhóm
            socket.on('user-receive-support-leave', (id) => {
                userJoinRooms = userJoinRooms.filter((i) => i.id_user != id);
                oa.emit('user-receive-support', userJoinRooms);
            });

            // // user đóng kết nối
            socket.on("disconnect", () => {
                socket.disconnect();
                clients = removeSocketIdToArray(clients, id, socket);
                oa.emit('user-logout', clients);

                userJoinRooms = userJoinRooms.filter(it => it.id_user != id);
                oa.emit('user-receive-support', userJoinRooms);
                
            });
        } catch (error) {
            console.log(error);
        }
    });
}

module.exports = {
    zaloOaSocket
}