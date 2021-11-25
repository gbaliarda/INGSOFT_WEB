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
let interval;

io.on('connection', socket => {

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
        const aux = currentRoom;
        let secAmount = 3
        io.to(currentRoom).emit("game found");

        rooms[currentRoom].interval = setInterval(() => {
          io.to(aux).emit("timer tick", secAmount--);
        }, 1000)

        setTimeout(() => {
          clearInterval(rooms[aux].interval)

          rooms[aux].interval = setInterval(() => {
            io.to(aux).emit("fog tick");
          }, 3000)

          io.to(aux).emit("start game", rooms[aux].users);
        }, 3000);

        currentRoom = uuid.v1();
      }
    })

    socket.on("change direction", (direction) => {
      socket.to(socketToRoom[socket.id]).emit("update direction", { id: socket.id, direction })
    })

    socket.on("players collision", () => {
      const roomID = socketToRoom[socket.id];

      if (rooms[roomID] == undefined)
        return

      socket.to(roomID).emit("player died", socket.id)
      rooms[roomID].users = rooms[roomID].users.filter(id => id != socket.id);
      delete socketToRoom[socket.id]
      socket.leave(roomID)
    })

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];

        if (rooms[roomID] == undefined)
          return

        if (roomID != currentRoom)
          socket.to(roomID).emit("player died", socket.id)

        rooms[roomID].users = rooms[roomID].users.filter(id => id != socket.id);
        delete socketToRoom[socket.id]
    });

    socket.on('game over', () => {
      const roomID = socketToRoom[socket.id];
      clearInterval(rooms[roomID].interval);
      delete rooms[roomID]
      delete socketToRoom[socket.id]
      socket.leave(roomID)
    })

});

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Server running on port ${port}`));