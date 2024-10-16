const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("Yeni istemci bağlandı");

  // Mevcut mesajları saklamak için bir dizi
  const messages = [];

  socket.on("requestUserId", () => {
    const userId = uuidv4();
    console.log("Kullanıcı ID oluşturuldu:", userId);
    socket.emit("userId", userId);
  });

  socket.on("message", (data) => {
    console.log("Mesaj alındı:", data);
    messages.push(data); // Yeni mesajı diziye ekle
    io.emit("message", data);
  });

  // Yeni getMessages olayı
  socket.on("getMessages", () => {
    console.log("Mesajlar talep edildi");
    socket.emit("messages", messages);
  });

  socket.on("disconnect", (reason) => {
    console.log("İstemci bağlantısı koptu:", reason);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
