const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const uuid = require("uuid");
const io = socket(server, {
  cors: {
    origin: "*",
  },
});

const socketToRoom = {};
// roomID -> cantPersonas
const rooms = {};
let currentRoom = null;
const maxPlayers = 2;

io.on('connection', socket => {
    // socket.on("join room", user => {
    //   console.log("User joined room ", user.wallet);
    //   socket.broadcast.emit("room full", user.wallet);
    //     if (users[roomID]) {
    //         const length = users[roomID].length;
    //         if (length === 2) {
    //             socket.emit("room full");
    //             return;
    //         }
    //         users[roomID].push(socket.id);
    //     } else {
    //         users[roomID] = [socket.id];
    //     }
    //     socketToRoom[socket.id] = roomID;
    //     const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

    //     socket.emit("all users", usersInThisRoom);
    // });

    socket.on("join room", (user) => {
      if (currentRoom == null)
        currentRoom = uuid.v1();
      
      socketToRoom[socket.id] = currentRoom;
      if (rooms[currentRoom])
        rooms[currentRoom].users.push(socket.id);
      else {
        rooms[currentRoom] = {}
        rooms[currentRoom].users = [socket.id];
      }

      socket.join(currentRoom);
      socket.to(currentRoom).emit("user joined", user);

      if (rooms[currentRoom].users.length == maxPlayers) {
        io.to(currentRoom).emit("start game", rooms[currentRoom].users);
        currentRoom = uuid.v1();
      }
    })

    socket.on("change direction", (direction) => {
      socket.to(socketToRoom[socket.id]).emit("update direction", { id: socket.id, direction })
    })

    socket.on("players collision", () => {
      socket.to(socketToRoom[socket.id]).emit("player died", socket.id)
      rooms[socketToRoom[socket.id]].users = rooms[socketToRoom[socket.id]].users.filter(id => id != socket.id);
      socket.leave(socketToRoom[socket.id])
    })

    // socket.on('disconnect', () => {
    //     const roomID = socketToRoom[socket.id];
    //     let room = users[roomID];
    //     if (room) {
    //         room = room.filter(id => id !== socket.id);
    //         users[roomID] = room;
    //         socket.broadcast.emit('user left', socket.id);
    //     }
    // });

});

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Server running on port ${port}`));