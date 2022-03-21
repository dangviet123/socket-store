const pushSocketIdToArray = (clients, userId, socketId) => {
    if(clients[userId]){
        clients[userId].push(socketId);
    }else{
        clients[userId] = [socketId];
    }
    return clients;
}

const removeSocketIdToArray = (clients, userId, socket)=>{
    clients[userId] = clients[userId].filter(socketId=>socketId !== socket.id);
    if(!clients[userId].length){
        delete clients[userId];
    }
    return clients;
}

const emitNotifyToArray = (clients, userId, socket, eventName, data) => {
  if (clients[userId]) {
    return clients[userId].forEach(socketId =>
      socket.to(socketId).emit(eventName, data)
    );
  } 
};

const emitNotifyToArrayNameSpace = (clients, userId, namspace, eventName, data) => {
  return clients[userId].forEach(socketId =>
    namspace.to(socketId).emit(eventName, data)
  ); 
};



module.exports = {
  pushSocketIdToArray,
  removeSocketIdToArray,
  emitNotifyToArray,
  emitNotifyToArrayNameSpace
};