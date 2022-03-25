const pushSocketIdToArray = (clients, userId, socketId) => {
    if(clients[userId]){
        clients[userId].push(socketId);
    }else{
        clients[userId] = [socketId];
    }
    return clients;
}

const pushSocketIdToArrayInfo = (clients, userId, socketId, infos) => {
  if (userId > 0) {
    if(clients[userId]){
        clients[userId].push({
          socketId: socketId,
          date: new Date(),
          full_name: infos.query.full_name,
          headers: infos.headers
        });
    }else{
        clients[userId] = [
          {
            socketId: socketId,
            date: new Date(),
            full_name: infos.query.full_name,
            headers: infos.headers
          }
        ];
    }
    return clients;
  }
}

const removeSocketIdToArrayInfo = (clients, userId, socket, headers)=>{
  if (userId > 0) {
    clients[userId] = clients[userId].filter(item=> item.socketId !== socket.id);
    if(!clients[userId].length){
        delete clients[userId];
    }
    return clients;
  }
}

const removeSocketIdToArray = (clients, userId, socket)=>{
  if (userId > 0) {
    clients[userId] = clients[userId].filter(socketId=>socketId !== socket.id);
    if(!clients[userId].length){
        delete clients[userId];
    }
    return clients;
  }
}

const emitNotifyToArray = (clients, userId, io, eventName, data) => {
  if (clients[userId]) {
    return clients[userId].forEach(socketId => {
      io.to(socketId).emit(eventName, data);
    });
  } 
};

const emitNotifyToArrayNameSpace = (clients, userId, namspace, eventName, data) => {
  return clients[userId].forEach(socketId =>
    namspace.to(socketId).emit(eventName, data)
  ); 
};



module.exports = {
  pushSocketIdToArray,
  pushSocketIdToArrayInfo,
  removeSocketIdToArray,
  emitNotifyToArray,
  emitNotifyToArrayNameSpace,
  removeSocketIdToArrayInfo
};