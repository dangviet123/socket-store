const moment = require("moment/moment");
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
    let groupRoomUsers = [];
    oa.on('connection', (socket) => {
        try {
            let id = socket.handshake.query.id;
            if (id && id !== 0) {
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
                
                // người dùng join vào phòng chat nội bộ

                userJoinRooms = userJoinRooms.filter(
                    it => it.id_user !== data.id_user
                );

                //  room chưa thuộc người nào
                if (userJoinRooms.filter(
                    it => it.user_id === data.user_id 
                    && it.active === true).length === 0
                ) {
                    userJoinRooms.push({...data, active: true});
                }else if (flag) {
                    userJoinRooms = userJoinRooms.filter(
                        it => it.user_id === data.user_id
                        ).map((item) => {
                        return {...item, active: false};
                    }).concat(
                        userJoinRooms.filter(
                            it => it.user_id !== data.user_id
                        )
                    );

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

            // người dùng gửi yêu cầu được tiếp nhận hỗ trợ
            socket.on('user-send-confirm-support', (id,user, item) => {
                if (clients[id] && clients[id].length > 0) {
                    clients[id].forEach((id) => { // gửi đến từng trình duyewetj người dùng đang mở
                        socket.to(id).emit('user-send-confirm-support',user, item);
                    });
                }
            });

            // từ chối yêu cầu nhận hỗ trợ
            socket.on('user-cancel-confirm-support', (user, sendId) => {
                if (clients[sendId] && clients[sendId].length > 0) {
                    clients[sendId].forEach((id) => { // gửi đến từng trình duyewetj người dùng đang mở
                        socket.to(id).emit('user-cancel-confirm-support',user);
                    });
                }

                // gửi sự kiện đến các tab còn lại
                if (clients[user.id_user] && clients[user.id_user].length > 0) {
                    clients[user.id_user].forEach((id) => { // gửi đến từng trình duyewetj người dùng đang mở
                        socket.to(id).emit('current-cancel-confirm-support');
                    });
                }
            });

            socket.on('current-ok-cancel-confirm-support', reId => {
                if (clients[reId] && clients[reId].length > 0) {
                    clients[reId].forEach((id) => { // gửi đến từng trình duyewetj người dùng đang mở
                        socket.to(id).emit('current-ok-cancel-confirm-support');
                    });
                }
            });

            // người dùng chấp nhận yêu cầu
            socket.on('user-ok-confirm-support', (user, sendUser, item) => {

                userJoinRooms = userJoinRooms.filter(
                    it => it.user_id === item.user_id
                    ).map((item) => {
                    return {
                        ...item, 
                        active: true,
                        id_user: sendUser.id_user,
                        display_name: sendUser?.display_name,
                        date: moment(),
                        photo: sendUser?.photo

                    };
                }).concat(
                    userJoinRooms.filter(
                        it => it.user_id !== item.user_id
                    )
                );

                oa.emit('user-receive-support', userJoinRooms);

                if (clients[sendUser.id_user] && clients[sendUser.id_user].length > 0) {
                    clients[sendUser.id_user].forEach((id) => { // gửi đến từng trình duyewetj người dùng đang mở
                        socket.to(id).emit('user-ok-confirm-support',user, item);
                    });
                }

                // gửi đến từng tab người yêu cầu
                if (clients[user.id_user] && clients[user.id_user].length > 0) {
                    clients[user.id_user].forEach((id) => { // gửi đến từng trình duyewetj người dùng đang mở
                        socket.to(id).emit('current-ok-confirm-support');
                    });
                }
            });

            socket.on('current-ok-ok-confirm-support', reId => {
                if (clients[reId] && clients[reId].length > 0) {
                    clients[reId].forEach((id) => {
                        // gửi đến từng trình duyewetj người dùng đang mở
                        socket.to(id).emit('current-ok-ok-confirm-support');
                    });
                }
            });


            // trao đổi thông tin nội bộ group customer
            socket.on('user-join-room-oas', (data) => {
                
                socket.join(data.user_id);
            });

            // người dùng gửi tinh nhắn nộ bộ
            socket.on('user-send-message-to-room', (message, room) => {
                
                socket.to(room).emit("user-send-message-to-room", message);
            });


            // người dùng rời khỏi phòng
            socket.on('user-leave-room-oas', (room) => {
                socket.leave(room);
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